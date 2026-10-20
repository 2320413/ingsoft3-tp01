# =========================
# ETAPA 1: BUILD
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY LosSantosAutoMarket.Api.csproj ./
COPY LosSantosAutoMarket.Api.Tests/LosSantosAutoMarket.Api.Tests.csproj LosSantosAutoMarket.Api.Tests/

RUN dotnet restore LosSantosAutoMarket.Api.Tests/LosSantosAutoMarket.Api.Tests.csproj

COPY . ./

RUN dotnet publish LosSantosAutoMarket.Api.csproj -c Release -o /app/publish


# =========================
# ETAPA 2: TESTS
# =========================
FROM build AS test

ENTRYPOINT ["dotnet", "test", "LosSantosAutoMarket.Api.Tests/LosSantosAutoMarket.Api.Tests.csproj", \
            "/p:CollectCoverage=true", \
            "/p:Threshold=80", \
            "/p:ThresholdType=line", \
            "/p:Exclude=[LosSantosAutoMarket.Api]Program*%2c[LosSantosAutoMarket.Api]LosSantosAutoMarket.Api.Data.*%2c[LosSantosAutoMarket.Api]LosSantosAutoMarket.Api.Models.*%2c[LosSantosAutoMarket.Api]LosSantosAutoMarket.Api.Migrations.*", \
            "--logger", "trx;LogFileName=tests.trx", \
            "--results-directory", "/out"]


# =========================
# ETAPA 3: RUNTIME
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "LosSantosAutoMarket.Api.dll"]