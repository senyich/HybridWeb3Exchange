FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["asp.net-service.csproj", "./"]
RUN dotnet restore "./asp.net-service.csproj"

COPY . .
RUN dotnet build "asp.net-service.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "asp.net-service.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "asp.net-service.dll"]