using AspNetCoreCustomItemGallery.Models;
using DevExpress.AspNetCore;
using DevExpress.DashboardAspNetCore;
using DevExpress.DashboardCommon;
using DevExpress.DashboardWeb;
using DevExpress.DataAccess.ConnectionParameters;
using DevExpress.DataAccess.Excel;
using DevExpress.DataAccess.Json;
using DevExpress.DataAccess.Sql;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using System;
using System.Data;

namespace AspNetCoreCustomItemGallery {
    public class Startup {
        public Startup(IConfiguration configuration, IWebHostEnvironment hostingEnvironment) {
            Configuration = configuration;
            FileProvider = hostingEnvironment.ContentRootFileProvider;
            DashboardExportSettings.CompatibilityMode = DashboardExportCompatibilityMode.Restricted;
        }

        public IFileProvider FileProvider { get; }
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services) {
            services
                .AddResponseCompression()
                .AddDevExpressControls()
                .AddMvc();
            services.AddScoped<DashboardConfigurator>((IServiceProvider serviceProvider) => {
                DashboardConfigurator configurator = new DashboardConfigurator();
                configurator.SetConnectionStringsProvider(new DashboardConnectionStringsProvider(Configuration));
                DashboardFileStorage dashboardFileStorage = new DashboardFileStorage(FileProvider.GetFileInfo("Data/Dashboards").PhysicalPath);
                configurator.SetDashboardStorage(dashboardFileStorage);
                DataSourceInMemoryStorage dataSourceStorage = new DataSourceInMemoryStorage();

                DashboardSqlDataSource sqlDataSource = new DashboardSqlDataSource("Sales Person", "NWindConnectionString");                
                sqlDataSource.DataProcessingMode = DataProcessingMode.Client;
                SelectQuery query = SelectQueryFluentBuilder
                    .AddTable("Categories")
                    .Join("Products", "CategoryID")
                    .SelectAllColumns()
                    .Build("Products_Categories");
                sqlDataSource.Queries.Add(query);
                dataSourceStorage.RegisterDataSource("sqlDataSource", sqlDataSource.SaveToXml());

                DashboardExcelDataSource energyStatistics = new DashboardExcelDataSource("Energy Statistics");
                energyStatistics.ConnectionName = "energyStatisticsDataConnection";
                energyStatistics.SourceOptions = new ExcelSourceOptions(new ExcelWorksheetSettings("Map Data"));
                dataSourceStorage.RegisterDataSource("energyStatisticsDataSource", energyStatistics.SaveToXml());

                DashboardObjectDataSource objDataSource = new DashboardObjectDataSource("Gantt Data", typeof(TasksData));
                objDataSource.DataId = "odsTaskData";
                dataSourceStorage.RegisterDataSource("objectDataSource", objDataSource.SaveToXml());

                configurator.DataLoading += Configurator_DataLoading;
                configurator.ConfigureDataConnection += Configurator_ConfigureDataConnection; ;
                configurator.SetDataSourceStorage(dataSourceStorage);

                return configurator;
            });
        }

        private void Configurator_ConfigureDataConnection(object sender, ConfigureDataConnectionWebEventArgs e) {
            if (e.DataSourceName == "Departments") {
                e.ConnectionParameters = new XmlFileConnectionParameters() { FileName = FileProvider.GetFileInfo("Data/Departments.xml").PhysicalPath };
            }
            if (e.ConnectionName == "energyStatisticsDataConnection") {
                e.ConnectionParameters = new ExcelDataSourceConnectionParameters(FileProvider.GetFileInfo("Data/EnergyStatistics.xls").PhysicalPath);
            }
        }

        private void Configurator_DataLoading(object sender, DataLoadingWebEventArgs e) {
            if (e.DataId == "odsTaskData") {
                DataSet dataSet = new DataSet();
                dataSet.ReadXml(FileProvider.GetFileInfo("Data/GanttData.xml").PhysicalPath);
                e.Data = dataSet.Tables[0];
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
            if(env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
            }
            else {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseDevExpressControls();

            app.UseRouting();
            app.UseEndpoints(endpoints => {
                EndpointRouteBuilderExtension.MapDashboardRoute(endpoints, "api/dashboard", "DefaultDashboard");
                endpoints.MapRazorPages();
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
