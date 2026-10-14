using FluentAssertions;
using ReconX.Domain.Exceptions;
using ReconX.Domain.ValueObjects;
using Xunit;

namespace ReconX.UnitTests;

public class MoneyValueObjectTests
{
    [Fact]
    public void Money_ShouldApplyBankersRoundingToFourDecimals()
    {
        // Act
        var moneyA = new Money(100.00005m, "IDR");
        var moneyB = new Money(100.00015m, "IDR");

        // Assert
        // Banker's Rounding: 0.00005 rounds to even (0.0000), 0.00015 rounds to even (0.0002)
        moneyA.Amount.Should().Be(100.0000m);
        moneyB.Amount.Should().Be(100.0002m);
    }

    [Fact]
    public void Money_ShouldThrowException_WhenCurrencyIsInvalid()
    {
        // Act & Assert
        var act1 = () => new Money(100m, "ID");
        var act2 = () => new Money(100m, "IDRR");
        var act3 = () => new Money(100m, "");

        act1.Should().Throw<DomainException>().WithMessage("*ISO-4217*");
        act2.Should().Throw<DomainException>().WithMessage("*ISO-4217*");
        act3.Should().Throw<DomainException>().WithMessage("*ISO-4217*");
    }

    [Fact]
    public void Money_ShouldAddCorrectly_WhenCurrenciesMatch()
    {
        // Arrange
        var a = new Money(500_000.5000m, "IDR");
        var b = new Money(250_000.2500m, "IDR");

        // Act
        var result = a + b;

        // Assert
        result.Amount.Should().Be(750_000.7500m);
        result.Currency.Should().Be("IDR");
    }

    [Fact]
    public void Money_ShouldThrowException_WhenOperatingBetweenDifferentCurrencies()
    {
        // Arrange
        var idr = new Money(100_000m, "IDR");
        var usd = new Money(10m, "USD");

        // Act
        var actAdd = () => idr + usd;
        var actSub = () => idr - usd;
        var actComp = () => idr > usd;

        // Assert
        actAdd.Should().Throw<DomainException>().WithMessage("*Currency mismatch*");
        actSub.Should().Throw<DomainException>().WithMessage("*Currency mismatch*");
        actComp.Should().Throw<DomainException>().WithMessage("*Currency mismatch*");
    }
}
