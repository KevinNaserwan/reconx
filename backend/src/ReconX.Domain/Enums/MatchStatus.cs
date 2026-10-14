namespace ReconX.Domain.Enums;

public enum MatchStatus
{
    Matched = 1,
    MatchedWithFeeVariance = 2,
    AmountMismatch = 3,
    MissingInternal = 4,
    MissingProvider = 5,
    Duplicate = 6,
    Pending = 7
}
