using System;
using System.Collections.Generic;
using System.Diagnostics;
using Journal.Server.DataAccess;
using Journal.Server.Services.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Journal.Server
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;

#if DEBUG
            // Logs sensitive information in debug builds.
            IdentityModelEventSource.ShowPII = true;
#endif
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
#if !NCRUNCH
            services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.AddSeq(Configuration.GetSection("SeqConfiguration"));
            });
#endif

            services.AddControllersWithViews();

            services.Configure<KeycloakConfiguration>(Configuration.GetSection(nameof(KeycloakConfiguration)));
            services.Configure<MongoConfiguration>(Configuration.GetSection(nameof(MongoConfiguration)));
            services.AddSingleton<ILoginProvider, KeycloakLoginProvider>();
            services.AddSingleton<IDocumentRepository, MongoDocumentRepository>();

            this.ConfigureCors(services);
            this.ConfigureAuthentication(services);

            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<Startup> log)
        {
            log.LogInformation("Starting journal...");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseCors();

#if !DEBUG
            app.UseHttpsRedirection();
#endif
            
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

#if !NCRUNCH
                // Disable dev server for unit tests.
                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
#endif
            });
        }

        [Conditional("DEBUG")]
        private void ConfigureCors(IServiceCollection services)
        {
            services.AddCors(builder =>
            {
                builder.AddDefaultPolicy(cors =>
                {
                    cors.AllowAnyOrigin();
                    cors.AllowAnyMethod();
                    cors.AllowAnyHeader();
                });
            });
        }

        private void ConfigureAuthentication(IServiceCollection services)
        {
            var config = new KeycloakConfiguration();
            Configuration.GetSection(nameof(KeycloakConfiguration)).Bind(config);
            config.Validate();

            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(opt =>
            {
                opt.RequireHttpsMetadata = false;
                opt.Authority = config.Authority;
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    RequireSignedTokens = true,
                    RequireExpirationTime = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuer = true,
                    ValidAudience = config.RequiredAudience
                };
            });
        }
    }
}
