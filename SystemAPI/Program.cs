using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// 1. IDAGDAG ANG CORS SERVICE RITO
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// 2. IDAGDAG ANG CORS MIDDLEWARE RITO (BAGO MAG-MAP CONTROLLERS)
app.UseCors("AllowAll");

app.MapControllers();

app.Run();