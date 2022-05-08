namespace Database.Lib;

public class MaritimoContextFactory : IMaritimoContextFactory
{
    private readonly string connectionString;

    public MaritimoContextFactory(string connectionString)
    {
        this.connectionString = connectionString;
    }

    public IMaritimoContext Get()
    {
        return new MaritimoContext(connectionString);
    }
}
