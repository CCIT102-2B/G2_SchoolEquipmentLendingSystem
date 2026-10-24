using Microsoft.AspNetCore.Mvc;
using API.Models;
using System.Collections.Generic;
using System.Linq;
using System;

namespace SystemAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemController : ControllerBase
    {
        // In-memory data storage (Magsisilbing pansamantalang database para sa demo)
        private static List<Equipment> equipmentList = new List<Equipment>
        {
            new Equipment { Id = 1, Name = "Dell Latitude Laptop", Category = "Computers", TotalStock = 5, Borrowed = 1 },
            new Equipment { Id = 2, Name = "Canon DSLR Camera", Category = "Media", TotalStock = 3, Borrowed = 0 },
            new Equipment { Id = 3, Name = "Epson Multimedia Projector", Category = "Classroom", TotalStock = 2, Borrowed = 1 },
            new Equipment { Id = 4, Name = "Lab Quest Physics Sensor", Category = "Science", TotalStock = 4, Borrowed = 0 },
            new Equipment { Id = 5, Name = "Basketball (Official Size)", Category = "Sports", TotalStock = 10, Borrowed = 2 }
        };

        private static List<BorrowRequest> requestList = new List<BorrowRequest>
        {
            new BorrowRequest { Id = 101, EquipmentId = 3, StudentId = "2024-0001", StudentName = "Juan Dela Cruz", Status = "Approved", RequestDate = DateTime.Now }
        };

        // ----------------------------------------------------
        // 1. EQUIPMENT ENDPOINTS
        // ----------------------------------------------------

        // GET: api/system/equipment (Kunin ang lahat ng kagamitan)
        [HttpGet("equipment")]
        public IActionResult GetEquipment()
        {
            return Ok(equipmentList);
        }

        // POST: api/system/equipment (Magdagdag ng bagong kagamitan - Admin)
        [HttpPost("equipment")]
        public IActionResult AddEquipment([FromBody] Equipment newEquip)
        {
            newEquip.Id = (int)DateTime.Now.Ticks;
            newEquip.Borrowed = 0;
            equipmentList.Add(newEquip);
            return Ok(new { message = "Matagumpay na naidagdag ang kagamitan!", equipment = newEquip });
        }

        // PUT: api/system/equipment/{id}/stock (Mag-adjust ng stock +1 o -1 - Admin)
        [HttpPut("equipment/{id}/stock")]
        public IActionResult AdjustStock(int id, [FromBody] StockAdjustmentModel model)
        {
            var item = equipmentList.FirstOrDefault(e => e.Id == id);
            if (item == null) return NotFound(new { message = "Hindi nahanap ang kagamitan." });

            if (model.Amount < 0 && (item.TotalStock + model.Amount) < item.Borrowed)
            {
                return BadRequest(new { message = "Hindi maaring bawasan ang stock dahil mas marami pa ang kasalukuyang hiniram!" });
            }

            item.TotalStock += model.Amount;
            if (item.TotalStock < 0) item.TotalStock = 0;

            return Ok(new { message = "Na-update ang stock!", item });
        }

        // DELETE: api/system/equipment/{id} (Mag-delete ng kagamitan - Admin)
        [HttpDelete("equipment/{id}")]
        public IActionResult DeleteEquipment(int id)
        {
            var item = equipmentList.FirstOrDefault(e => e.Id == id);
            if (item == null) return NotFound(new { message = "Hindi nahanap ang kagamitan." });

            if (item.Borrowed > 0)
            {
                return BadRequest(new { message = "Hindi maaring tanggalin ang kagamitang ito habang may kasalukuyang nakahiram." });
            }

            equipmentList.Remove(item);
            return Ok(new { message = "Matagumpay na natanggal ang kagamitan sa inventory!" });
        }

        // ----------------------------------------------------
        // 2. BORROW REQUESTS ENDPOINTS
        // ----------------------------------------------------

        // GET: api/system/requests (Kunin ang lahat ng requests)
        [HttpGet("requests")]
        public IActionResult GetRequests()
        {
            return Ok(requestList);
        }

        // POST: api/system/requests (Mag-submit ng hiram ang estudyante)
        [HttpPost("requests")]
        public IActionResult CreateRequest([FromBody] BorrowRequest req)
        {
            req.Id = (int)DateTime.Now.Ticks;
            req.Status = "Pending";
            req.RequestDate = DateTime.Now;
            requestList.Add(req);
            return Ok(new { message = "Naipadala na ang request sa Admin!", request = req });
        }

        // PUT: api/system/requests/{id}/approve (Admin Appove)
        [HttpPut("requests/{id}/approve")]
        public IActionResult ApproveRequest(int id)
        {
            var req = requestList.FirstOrDefault(r => r.Id == id);
            if (req == null) return NotFound(new { message = "Hindi nahanap ang request." });

            var equip = equipmentList.FirstOrDefault(e => e.Id == req.EquipmentId);
            if (equip == null || (equip.TotalStock - equip.Borrowed) <= 0)
            {
                return BadRequest(new { message = "Hindi ma-approve dahil wala nang available na stock!" });
            }

            req.Status = "Approved";
            equip.Borrowed += 1;

            return Ok(new { message = "Matagumpay na na-approve ang request!" });
        }

        // PUT: api/system/requests/{id}/reject (Admin Reject)
        [HttpPut("requests/{id}/reject")]
        public IActionResult RejectRequest(int id)
        {
            var req = requestList.FirstOrDefault(r => r.Id == id);
            if (req == null) return NotFound(new { message = "Hindi nahanap ang request." });

            req.Status = "Rejected";
            return Ok(new { message = "Na-reject ang request." });
        }

        // PUT: api/system/requests/{id}/return (Return Item)
        [HttpPut("requests/{id}/return")]
        public IActionResult ReturnItem(int id)
        {
            var req = requestList.FirstOrDefault(r => r.Id == id);
            if (req == null) return NotFound(new { message = "Hindi nahanap ang record." });

            var equip = equipmentList.FirstOrDefault(e => e.Id == req.EquipmentId);
            if (equip != null && equip.Borrowed > 0)
            {
                equip.Borrowed -= 1;
            }

            requestList.Remove(req);
            return Ok(new { message = "Matagumpay na naibalik ang kagamitan!" });
        }
    }

    // Supplementary class para sa pagpasa ng stock adjustment value sa JSON body
    public class StockAdjustmentModel
    {
        public int Amount { get; set; }
    }
}
