using System;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Journal.EnvSetup
{
    class Program
    {
        static void Main(string[] args)
        {
            SetupMongo();

            Console.WriteLine();
            Console.WriteLine("Press any key to exit");
            Console.ReadKey();
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

            var success = false;
            try
            {
                var result = db.RunCommand<BsonDocument>(cmd);
                success = result.GetElement("ok").Value.ToString() == "1";
            }
            catch (Exception ex)
            {
                PrintException("adding user", ex);
            }

            PrintStatus("adding user", success);
        }

        static void PrintTitle(string title)
        {
            var color = Console.ForegroundColor;
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine();
            Console.WriteLine($"# {title}");
            Console.ForegroundColor = color;
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
