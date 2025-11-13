using System.Text.Json;

namespace TaskManager.API.Models
{
    public class WorkTask
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Duration { get; set; } // Duration in minutes
        public DateTime Date { get; set; }
        public string Type { get; set; } = "individual"; // individual or shared
        public int UserId { get; set; }
        public int? SharedWith { get; set; } // If shared task
        public int? SharePercentage { get; set; } // Percentage share
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class TaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Duration { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; } = "individual";
        public int? SharedWith { get; set; }
        public int? SharePercentage { get; set; }
        public int UserId { get; set; }
    }

    public class TaskData
    {
        public List<WorkTask> Tasks { get; set; } = new();
        public int NextId { get; set; } = 1;
    }
}