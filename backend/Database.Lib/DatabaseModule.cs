using Ninject.Modules;

namespace Database.Lib;

public class DatabaseModule : NinjectModule
{
    private readonly string connectionString;

    public override void Load()
    {
        Kernel.Bind<IMaritimoContextFactory>().To<MaritimoContextFactory>().InSingletonScope().WithConstructorArgument("connectionString", connectionString);
        Kernel.Bind<IDatabaseService>().To<DatabaseService>();
    }

    public DatabaseModule(string connectionString)
    {
        this.connectionString = connectionString;
    }
}