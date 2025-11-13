using Microsoft.AspNetCore.Mvc;
using TaskManager.API.Models;
using System.Text.Json;
using System.Collections.Concurrent;
using System.IO;

namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private static List<User> _users = new();
        private static readonly string _usersFile = Path.Combine(Directory.GetCurrentDirectory(), "data", "users.json");
        private static readonly ConcurrentDictionary<string, UserSession> _sessions = new();
    

        public AuthController()
        {
            LoadUsers();
            if (!_users.Any())
            {
                // Initialize with default users
                _users.AddRange(new[]
                {
                    new User { Id = 1, Username = "admin", Password = "admin123", Role = "Admin", FullName = "System Admin", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { Id = 2, Username = "employee1", Password = "123456", Role = "Employee", FullName = "Employee 1", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { Id = 3, Username = "employee2", Password = "123456", Role = "Employee", FullName = "Employee 2", IsActive = true, CreatedAt = DateTime.UtcNow }
                });
                SaveUsers();
            }
        }

        [HttpPost("login")]
        public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
        {
            var user = _users.FirstOrDefault(u => 
                u.Username == request.Username && 
                u.Password == request.Password && 
                u.IsActive);

            if (user == null)
            {
                return Ok(new LoginResponse 
                { 
                    Success = false, 
                    Message = "Invalid username or password" 
                });
            }

            // Create session
            var token = Guid.NewGuid().ToString();
            _sessions[token] = new UserSession
            {
                UserId = user.Id,
                Username = user.Username,
                LoginTime = DateTime.UtcNow
            };

            return Ok(new LoginResponse 
            { 
                Success = true, 
                Message = "Login successful",
                User = user,
                Token = token
            });
        }

        [HttpPost("logout")]
        public ActionResult Logout([FromHeader] string authorization)
        {
            if (!string.IsNullOrEmpty(authorization) && authorization.StartsWith("Bearer "))
            {
                var token = authorization.Substring(7);
                if (_sessions.ContainsKey(token))
                {
                    _sessions.TryRemove(token, out _);
                }
            }
            return Ok(new { Success = true, Message = "Logout successful" });
        }

        [HttpGet("users")]
        public ActionResult<List<User>> GetUsers()
        {
            return Ok(_users.Where(u => u.IsActive).ToList());
        }

        [HttpPost("register")]
        public ActionResult<User> RegisterUser([FromBody] User newUser)
        {
            try
            {
                Console.WriteLine($"Registering user: {JsonSerializer.Serialize(newUser)}");

                // Check if username exists
                if (_users.Any(u => u.Username == newUser.Username))
                {
                    return BadRequest("Username already exists");
                }

                // Create new user
                var user = new User
                {
                    Id = _users.Any() ? _users.Max(u => u.Id) + 1 : 1,
                    Username = newUser.Username,
                    Password = newUser.Password,
                    Role = newUser.Role,
                    FullName = newUser.FullName,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _users.Add(user);
                SaveUsers();

                Console.WriteLine($"User created: {user.Id} - {user.Username}");
                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating user: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("users/{id}")]
        public ActionResult<User> UpdateUser(int id, [FromBody] User updatedUser)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            user.Username = updatedUser.Username;
            user.FullName = updatedUser.FullName;
            user.Role = updatedUser.Role;
            user.IsActive = updatedUser.IsActive;

            if (!string.IsNullOrEmpty(updatedUser.Password))
            {
                user.Password = updatedUser.Password;
            }

            SaveUsers();
            return Ok(user);
        }

        [HttpDelete("users/{id}")]
        public ActionResult DeleteUser(int id)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            // Don't delete admin user
            if (user.Id == 1)
            {
                return BadRequest("Cannot delete admin user");
            }

            _users.Remove(user);
            SaveUsers();
            return NoContent();
        }

        // Helper method to validate token
        public static bool ValidateToken(string token)
        {
            return !string.IsNullOrEmpty(token) && _sessions.ContainsKey(token);
        }

        public static User GetUserFromToken(string token)
        {
            if (_sessions.TryGetValue(token, out var session))
            {
                return _users.FirstOrDefault(u => u.Id == session.UserId);
            }
            return null;
        }

        private void LoadUsers()
        {
            try
            {
                if (System.IO.File.Exists(_usersFile))
                {
                    var json = System.IO.File.ReadAllText(_usersFile);
                    _users = JsonSerializer.Deserialize<List<User>>(json) ?? new List<User>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading users: {ex.Message}");
                _users = new List<User>();
            }
        }

        private void SaveUsers()
        {
            try
            {
                var json = JsonSerializer.Serialize(_users, new JsonSerializerOptions { WriteIndented = true });
                System.IO.File.WriteAllText(_usersFile, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving users: {ex.Message}");
            }
        }
    }

    // این کلاس‌ها فقط در این فایل تعریف شوند
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public User? User { get; set; }
        public string Token { get; set; } = string.Empty;
    }

    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";
        public string FullName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserSession
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public DateTime LoginTime { get; set; }
    }
}