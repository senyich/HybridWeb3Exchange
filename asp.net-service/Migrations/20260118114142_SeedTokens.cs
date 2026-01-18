using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace asp.net_service.Migrations
{
    /// <inheritdoc />
    public partial class SeedTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EthTickers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TimeStamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EthTickers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Symbol = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tokens", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Tokens",
                columns: new[] { "Id", "Address", "Name", "Symbol" },
                values: new object[,]
                {
                    { new Guid("710ebcf7-3d63-476d-b16c-56c80d6ede65"), "0x3b2a9049685AACb584789C630d8c3d1d15D77AbD", "MonkeyCoin", "MC" },
                    { new Guid("d91dfbbe-74b9-49df-a3e6-e75521b4222d"), "0x9c5956607797FdC78216FfDc4d608953eED655ad", "TopGEM", "TG" },
                    { new Guid("f8574459-7035-4406-8d5e-a092a8e7eed2"), "0x8EdDd55579F72E99fCbe2fc9747edd46B1f032AC", "TopCOIN", "TC" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EthTickers");

            migrationBuilder.DropTable(
                name: "Tokens");
        }
    }
}
