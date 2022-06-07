FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

LABEL maintainer="hi@joaobruno.xyz"
ENV REFRESHED_AT 2022-06-07

WORKDIR /source
ARG PROJECT_NAME

COPY . .

RUN dotnet restore "$PROJECT_NAME/$PROJECT_NAME.csproj"
RUN dotnet publish "$PROJECT_NAME/$PROJECT_NAME.csproj" -c release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/runtime:6.0

RUN apt-get update && apt-get install -y netcat wait-for-it && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app .
