var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS برای همه
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// ایجاد پوشه data اگر وجود ندارد
var dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data");
if (!Directory.Exists(dataPath))
{
    Directory.CreateDirectory(dataPath);
}
var app = builder.Build();

// همیشه Swagger را نشان بده
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// برای Railway
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
var url = $"http://0.0.0.0:{port}";
app.Run(url);