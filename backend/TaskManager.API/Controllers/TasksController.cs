using Microsoft.AspNetCore.Mvc;
using TaskManager.API.Models;
using System.Text.Json;
using System.IO;

namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private static List<WorkTask> _tasks = new();
        private static int _nextId = 1;
        private static readonly string _dataFile = Path.Combine(Directory.GetCurrentDirectory(), "data", "tasks.json");

        public TasksController()
        {
            LoadTasks();
        }

        // GET: api/tasks
        [HttpGet]
        public ActionResult<List<WorkTask>> GetTasks([FromQuery] int userId, [FromQuery] string? date = null)
        {
            var userTasks = _tasks.Where(t => t.UserId == userId).ToList();

            if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var filterDate))
            {
                userTasks = userTasks.Where(t => t.Date.Date == filterDate.Date).ToList();
            }

            return Ok(userTasks);
        }

        // GET: api/tasks/5
        [HttpGet("{id}")]
        public ActionResult<WorkTask> GetTask(int id)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
            {
                return NotFound();
            }
            return Ok(task);
        }

        // POST: api/tasks
        [HttpPost]
        public ActionResult<WorkTask> CreateTask([FromBody] TaskRequest request)
        {
            try
            {
                Console.WriteLine($"Received task data: {JsonSerializer.Serialize(request)}");

                var task = new WorkTask
                {
                    Id = _nextId++,
                    Title = request.Title ?? "Untitled",
                    Amount = request.Amount,
                    Duration = request.Duration,
                    Date = request.Date,
                    Type = request.Type ?? "individual",
                    UserId = request.UserId,
                    SharedWith = request.SharedWith,
                    SharePercentage = request.SharePercentage,
                    CreatedAt = DateTime.UtcNow
                };

                _tasks.Add(task);
                SaveTasks();

                Console.WriteLine($"Task created: {task.Id} - {task.Title}");
                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating task: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/tasks/5
        [HttpPut("{id}")]
        public ActionResult<WorkTask> UpdateTask(int id, [FromBody] TaskRequest request)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
            {
                return NotFound();
            }

            task.Title = request.Title;
            task.Amount = request.Amount;
            task.Duration = request.Duration;
            task.Date = request.Date;
            task.Type = request.Type;
            task.SharedWith = request.SharedWith;
            task.SharePercentage = request.SharePercentage;

            SaveTasks();
            return Ok(task);
        }

        // DELETE: api/tasks/5
        [HttpDelete("{id}")]
        public ActionResult DeleteTask(int id)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
            {
                return NotFound();
            }

            _tasks.Remove(task);
            SaveTasks();
            return NoContent();
        }

        // GET: api/tasks/summary
        [HttpGet("summary")]
        public ActionResult<object> GetSummary([FromQuery] int userId, [FromQuery] string date)
        {
            if (!DateTime.TryParse(date, out var filterDate))
            {
                filterDate = DateTime.Today;
            }

            var userTasks = _tasks.Where(t => t.UserId == userId && t.Date.Date == filterDate.Date).ToList();

            var summary = new
            {
                TotalTasks = userTasks.Count,
                TotalAmount = userTasks.Sum(t => t.Amount),
                TotalDuration = userTasks.Sum(t => t.Duration),
                Date = filterDate.ToString("yyyy-MM-dd")
            };

            return Ok(summary);
        }

        private void LoadTasks()
        {
            try
            {
                if (System.IO.File.Exists(_dataFile))
                {
                    var json = System.IO.File.ReadAllText(_dataFile);
                    var data = JsonSerializer.Deserialize<TaskData>(json);
                    _tasks = data?.Tasks ?? new List<WorkTask>();
                    _nextId = data?.NextId ?? (_tasks.Any() ? _tasks.Max(t => t.Id) + 1 : 1);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading tasks: {ex.Message}");
                _tasks = new List<WorkTask>();
                _nextId = 1;
            }
        }

        private void SaveTasks()
        {
            try
            {
                var data = new TaskData { Tasks = _tasks, NextId = _nextId };
                var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
                System.IO.File.WriteAllText(_dataFile, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving tasks: {ex.Message}");
            }
        }
    }
}