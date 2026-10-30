using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System;
using SystemAPI.Models;

namespace SystemAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemController : ControllerBase
    {
        private static List<Equipment> equipmentList = new List<Equipment>
        {
            new Equipment { Id = 1, Name = "Dell Latitude Laptop", TotalStock = 5, Borrowed = 1 },
            new Equipment { Id = 2, Name = "Canon DSLR Camera", TotalStock = 3, Borrowed = 0 },
            new Equipment { Id = 3, Name = "Epson Multimedia Projector", TotalStock = 2, Borrowed = 1 },
            new Equipment { Id = 4, Name = "Lab Quest Physics Sensor", TotalStock = 4, Borrowed = 0 },
            new Equipment { Id = 5, Name = "Basketball (Official Size)", TotalStock = 10, Borrowed = 2 }
        };

        private static List<BorrowRequest> requestList = new List<BorrowRequest>
        {
            new BorrowRequest { Id = 101, EquipmentId = 3, StudentId = "s2025102331", StudentName = "Ace", Status = "Approved" }
        };

        // --- EQUIPMENT ENDPOINTS ---
        [HttpGet("equipment")]
        public IActionResult GetEquipment() => Ok(equipmentList);

        [HttpPost("equipment")]
        public IActionResult AddEquipment([FromBody] Equipment newEquip)
        {
            newEquip.Id = new Random().Next(1000, 9999);
            newEquip.Borrowed = 0;
            equipmentList.Add(newEquip);
            return Ok(new { message = "Equipment added successfully!", equipment = newEquip });
        }

        [HttpPut("equipment/{id}/stock")]
        public IActionResult AdjustStock(int id, [FromBody] StockAdjustmentModel model)
        {
            var item = equipmentList.FirstOrDefault(e => e.Id == id);
            if (item == null) return NotFound(new { message = "Equipment not found." });

            if (model.Amount < 0 && (item.TotalStock + model.Amount) < item.Borrowed)
            {
                return BadRequest(new { message = "Cannot decrease stock below current borrowed count!" });
            }

            item.TotalStock += model.Amount;
            if (item.TotalStock < 0) item.TotalStock = 0;

            return Ok(new { message = "Stock updated!", item });
        }

        [HttpDelete("equipment/{id}")]
        public IActionResult DeleteEquipment(int id)
        {
            var item = equipmentList.FirstOrDefault(e => e.Id == id);
            if (item == null) return NotFound(new { message = "Equipment not found." });

            if (item.Borrowed > 0)
            {
                return BadRequest(new { message = "Cannot delete equipment while items are currently borrowed." });
            }

            equipmentList.Remove(item);
            return Ok(new { message = "Equipment deleted!" });
        }

        // --- BORROW REQUESTS ENDPOINTS ---
        [HttpGet("requests")]
        public IActionResult GetRequests() => Ok(requestList);

        [HttpPost("requests")]
        public IActionResult CreateRequest([FromBody] BorrowRequest req)
        {
            req.Id = new Random().Next(10000, 99999);
            req.Status = "Pending";
            requestList.Add(req);
            return Ok(new { message = "Request submitted!", request = req });
        }

        [HttpPut("requests/{id}/approve")]
        public IActionResult ApproveRequest(int id)
        {
            var req = requestList.FirstOrDefault(r => r.Id == id);
            if (req == null) return NotFound(new { message = "Request not found." });

            var equip = equipmentList.FirstOrDefault(e => e.Id == req.EquipmentId);
            if (equip == null || (equip.TotalStock - equip.Borrowed) <= 0)
            {
                return BadRequest(new { message = "No available stock to approve this request!" });
            }

            req.Status = "Approved";
            equip.Borrowed += 1;

            return Ok(new { message = "Request approved!" });
        }

        [HttpPut("requests/{id}/reject")]
        public IActionResult RejectRequest(int id)
        {
            var req = requestList.FirstOrDefault(r => r.Id == id);
            if (req == null) return NotFound(new { message = "Request not found." });

            req.Status = "Rejected";
            return Ok(new { message = "Request rejected." });
        }

        [HttpPut("requests/{id}/return")]
        public IActionResult ReturnEquipment(int id)
        {
            var req = requestList.FirstOrDefault(r => r.Id == id);
            if (req == null) return NotFound(new { message = "Request not found." });

            if (req.Status == "Approved")
            {
                var equip = equipmentList.FirstOrDefault(e => e.Id == req.EquipmentId);
                if (equip != null && equip.Borrowed > 0)
                {
                    equip.Borrowed -= 1;
                }
                req.Status = "Returned";
            }

            return Ok(new { message = "Item returned successfully!" });
        }
    }
}