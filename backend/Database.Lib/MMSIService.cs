namespace Database.Lib;

public class MMSIService : IMMSIService
{
    Dictionary<ObjectType, int> MidStartPositionByObjectType = new Dictionary<ObjectType, int>()
    {
        [ObjectType.Ship] = 0,
        [ObjectType.GroupsOfShips] = 1,
        [ObjectType.BaseStations] = 2,
        [ObjectType.SearchAndRescueAircraft] = 3,
        [ObjectType.AidsToNavigation] = 2,
        [ObjectType.CraftAssociatedWithParentShip] = 2,
    };

    public int? GetCountryCodeByMMSI(uint mmsi)
    {
        string mmsiString = mmsi.ToString().PadLeft(9, '0');

        var objectType = GetObjectTypeByMMSI(mmsi);

        if (MidStartPositionByObjectType.ContainsKey(objectType))
        {
            return Int32.Parse(mmsiString.Substring(MidStartPositionByObjectType[objectType], 3));
        }

        return null;
    }

    public ObjectType GetObjectTypeByMMSI(uint mmsi)
    {
        string mmsiString = mmsi.ToString().PadLeft(9, '0');

        if (mmsiString.StartsWith("974"))
        {
            return ObjectType.EmergencyPositionIndicatingRadioBeacons;
        }
        else if (mmsiString.StartsWith("972"))
        {
            return ObjectType.ManOverboard;
        }
        else if (mmsiString.StartsWith("970"))
        {
            return ObjectType.SearchAndRescueTransmitter;
        }
        else if (mmsiString.StartsWith("111"))
        {
            return ObjectType.SearchAndRescueAircraft;
        }
        else if (mmsiString.StartsWith("98"))
        {
            return ObjectType.CraftAssociatedWithParentShip;
        }
        else if (mmsiString.StartsWith("99"))
        {
            return ObjectType.AidsToNavigation;
        }
        else if (mmsiString.StartsWith("00"))
        {
            return ObjectType.BaseStations;
        }
        else if (mmsiString.StartsWith("0"))
        {
            return ObjectType.GroupsOfShips;
        }

        return ObjectType.Ship;
    }
}
