using System;
using System.Collections.Generic;
using System.Security.Permissions;
using MongoDB.Bson;
using MongoDB.Driver;
using Seq.Api;
using Seq.Api.Model.Inputs;
using Seq.Api.Model.Security;

namespace Journal.EnvSetup
{
    class Program
    {
        static Dictionary<string, string> GeneratedOutput = new Dictionary<string, string>();

        static void Main(string[] args)
        {
            SetupMongo();

            SetupSeq();

            PrintConfig();

            Console.WriteLine();
            Console.WriteLine("Press any key to exit");
            Console.ReadKey();
        }

        static void SetupSeq()
        {
            PrintTitle("Setting up Seq");
            var connection = new SeqConnection("http://localhost:8081");
            var entity = new ApiKeyEntity
            {
                Title = "journal",
                AssignedPermissions = new HashSet<Permission> { Permission.Ingest },
                InputSettings = new InputSettingsPart
                {
                    AppliedProperties = new List<InputAppliedPropertyPart>
                    {
                        new InputAppliedPropertyPart { Name = "app", Value = "journal" }
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
            var client = new MongoClient("mongodb://admin:dev@localhost");
            var db = client.GetDatabase("journal");
            var cmd = BsonDocument.Parse(@"{
                createUser: ""test"",
                pwd: ""test"",
                roles: [ ""readWrite"" ]
            }");

            Task("Add 'test' user", () =>
            {
                var result = db.RunCommand<BsonDocument>(cmd);
                var success = result.GetElement("ok").Value.ToString() == "1";
                if (!success)
                    throw new ApplicationException($"Result: {result}");
            });
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
