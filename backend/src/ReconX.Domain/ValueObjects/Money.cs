using ReconX.Domain.Exceptions;

namespace ReconX.Domain.ValueObjects;

public sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        if (string.IsNullOrWhiteSpace(currency) || currency.Trim().Length != 3)
        {
            throw new DomainException($"Invalid currency code: '{currency}'. Currency must be a 3-character ISO-4217 code.");
        }

        // Round to 4 decimal places using Banker's Rounding (MidpointRounding.ToEven)
        Amount = Math.Round(amount, 4, MidpointRounding.ToEven);
        Currency = currency.Trim().ToUpperInvariant();
    }

    public static Money Zero(string currency = "IDR") => new(0m, currency);

    public Money Add(Money other)
    {
        EnsureSameCurrency(other);
        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        EnsureSameCurrency(other);
        return new Money(Amount - other.Amount, Currency);
    }

    public static Money operator +(Money a, Money b) => a.Add(b);
    public static Money operator -(Money a, Money b) => a.Subtract(b);

    public static bool operator >(Money a, Money b)
    {
        a.EnsureSameCurrency(b);
        return a.Amount > b.Amount;
    }

    public static bool operator <(Money a, Money b)
    {
        a.EnsureSameCurrency(b);
        return a.Amount < b.Amount;
    }

    public static bool operator >=(Money a, Money b)
    {
        a.EnsureSameCurrency(b);
        return a.Amount >= b.Amount;
    }

    public static bool operator <=(Money a, Money b)
    {
        a.EnsureSameCurrency(b);
        return a.Amount <= b.Amount;
    }

    private void EnsureSameCurrency(Money other)
    {
        if (!string.Equals(Currency, other.Currency, StringComparison.OrdinalIgnoreCase))
        {
            throw new DomainException($"Currency mismatch: Cannot operate between {Currency} and {other.Currency}.");
        }
    }

    public override string ToString() => $"{Currency} {Amount:N4}";
}
