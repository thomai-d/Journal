using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using Flurl.Http;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Seq.Api;
using Seq.Api.Model.Inputs;
using Seq.Api.Model.Security;

namespace Journal.EnvSetup
{
    class Program
    {
        const string AppName = "journal";
        const string SeqUrl = "http://localhost:8081";
        const string MongoUrl = "mongodb://admin:dev@localhost";
        const string CreateMongoUser = "test";
        const string CreateMongoPass = "test";
        const string KeycloakDockerName = "keycloak";
        const string KeycloakAdminUser = "admin";
        const string KeycloakAdminPass = "dev";
        const string KeycloakUrl = "http://localhost:8080";
        const string CreateKeycloakUser = "test";
        const string CreateKeycloakPass = "test";

        static Dictionary<string, string> GeneratedOutput = new Dictionary<string, string>();

        static void Main(string[] args)
        {
            SetupMongo();

            SetupSeq();

            SetupKeycloak();

            PrintConfig();

            Console.WriteLine();
            Console.WriteLine("Press any key to exit");
            Console.ReadKey();
        }

        static void SetupSeq()
        {
            PrintTitle("Setting up Seq");
            var connection = new SeqConnection(SeqUrl);
            var entity = new ApiKeyEntity
            {
                Title = AppName,
                AssignedPermissions = new HashSet<Permission> { Permission.Ingest },
                InputSettings = new InputSettingsPart
                {
                    AppliedProperties = new List<InputAppliedPropertyPart>
                    {
                        new InputAppliedPropertyPart { Name = "app", Value = AppName }
                    }
                }
            };

            Task("Add API key", () =>
            {
                var result = connection.ApiKeys.AddAsync(entity).Result;
                GeneratedOutput.Add("SeqConfiguration::ApiKey", result.Token);
            });
        }

        static void SetupMongo()
        {
            PrintTitle("Setting up MongoDB");
            var client = new MongoClient(MongoUrl);
            var db = client.GetDatabase(AppName);
            var cmd = BsonDocument.Parse($@"{{
                createUser: ""{CreateMongoUser}"",
                pwd: ""{CreateMongoPass}"",
                roles: [ ""readWrite"" ]
            }}");

            Task($"Add '{CreateMongoUser}' user", () =>
            {
                var result = db.RunCommand<BsonDocument>(cmd);
                var success = result.GetElement("ok").Value.ToString() == "1";
                if (!success)
                    throw new ApplicationException($"Result: {result}");
            });
        }

        static void SetupKeycloak()
        {
            PrintTitle("Setup keycloak");
            Task($"Add '{KeycloakAdminUser}' user", () => { Exec("docker", $"exec -it {KeycloakDockerName} /opt/jboss/keycloak/bin/add-user-keycloak.sh -u {KeycloakAdminUser} -p {KeycloakAdminPass}"); });
            Task("Restart container", () => { Exec("docker", $"stop {KeycloakDockerName}"); Exec("docker", $"start {KeycloakDockerName}"); });

            Task("Wait for server startup", () =>
            {
                while (true)
                {
                    try
                    {
                        KeycloakUrl.GetAsync().Wait();
                        break;
                    }
                    catch (AggregateException)
                    {
                        Console.WriteLine("... waiting for server startup");
                        Thread.Sleep(3000);
                    }
                }
            });

            var token = string.Empty;
            Task("Login", () =>
            {
                var data = new
                {
                    username = KeycloakAdminUser,
                    password = KeycloakAdminPass,
                    grant_type = "password",
                    client_id = "admin-cli",
                };

                var resp = $"{KeycloakUrl}/auth/realms/master/protocol/openid-connect/token".PostUrlEncodedAsync(data).Result;
                var json = resp.Content.ReadAsStringAsync().Result;
                token = JObject.Parse(json)["access_token"].Value<string>();
            });

            Task("Get client secret", () =>
            {
                var resp = $"{KeycloakUrl}/auth/{KeycloakAdminUser}/realms/{AppName}/clients/7bfd1e66-aa33-4525-ab31-9cc0bc58e861/client-secret"
                            .WithOAuthBearerToken(token)
                            .GetAsync().Result;
                var json = resp.Content.ReadAsStringAsync().Result;
                var secret = JObject.Parse(json)["value"].Value<string>();
                GeneratedOutput.Add("KeycloakConfiguration:ClientSecret", secret);
            });

            Task($"Add '{CreateKeycloakUser}' user", () =>
            {
                var user = new
                {
                    username = CreateKeycloakUser,
                    enabled = true,
                };
                var resp = $"{KeycloakUrl}/auth/{KeycloakAdminUser}/realms/{AppName}/users"
                            .WithOAuthBearerToken(token)
                            .PostJsonAsync(user).Result;
            });

            Task($"Set '{CreateKeycloakUser}' user password", () =>
            {
                var resp = $"{KeycloakUrl}/auth/{KeycloakAdminUser}/realms/{AppName}/users?username={CreateKeycloakUser}"
                            .WithOAuthBearerToken(token)
                            .GetAsync().Result;
                var json = resp.Content.ReadAsStringAsync().Result;
                var userid = JArray.Parse(json)[0]["id"].Value<string>();

                resp = $"{KeycloakUrl}/auth/{KeycloakAdminUser}/realms/{AppName}/users/{userid}/reset-password"
                            .WithOAuthBearerToken(token)
                            .PutJsonAsync(new { type = "password", value = CreateKeycloakPass }).Result;
            });
        }

        static void Exec(string file, string args)
        {
            var process = Process.Start(new ProcessStartInfo(file, args));
            process.WaitForExit();
            if (process.ExitCode != 0)
                throw new ApplicationException($"{file} exited with {process.ExitCode}");
        }

        static void PrintConfig()
        {
            Console.WriteLine();
            PrintTitle("Configuration");
            foreach (var item in GeneratedOutput)
            {
                Console.WriteLine($"{item.Key} = {item.Value}");
            }
        }

        static void PrintTitle(string title)
        {
            var color = Console.ForegroundColor;
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine();
            Console.WriteLine($"# {title}");
            Console.ForegroundColor = color;
        }

        static void Task(string name, Action action)
        {
            try
            {
                action();
                PrintStatus(name, success: true);
            }
            catch (Exception ex)
            {
                PrintException(name, ex);
                PrintStatus(name, success: false);
            }
        }

        static void PrintException(string action, Exception ex)
        {
            var color = Console.ForegroundColor;
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"{ex.GetType().Name} while {action}:\n{ex.Message}");
            Console.ForegroundColor = color;
        }

        static void PrintStatus(string action, bool success)
        {
            Console.Write(action + " - ");
            var color = Console.ForegroundColor;
            Console.ForegroundColor = success ? ConsoleColor.Green : ConsoleColor.Red;
            Console.WriteLine(success ? "OK" : "FAILED");
            Console.ForegroundColor = color;
        }
    }
}
