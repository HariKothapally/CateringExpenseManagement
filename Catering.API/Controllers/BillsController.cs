using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using System.Text;
using System.Net.Http;
using Newtonsoft.Json;

namespace Catering.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BillsController : ControllerBase
    {
        private readonly IBillRepository _repository;
        private readonly string _geminiApiKey;

        public BillsController(IBillRepository repository, IConfiguration configuration)
        {
            _repository = repository;
            _geminiApiKey = configuration["GeminiApiKey"];
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScannedBill>>> GetBills()
        {
            return Ok(await _repository.GetAllBillsAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScannedBill>> GetBillById(string id)
        {
            var bill = await _repository.GetBillByIdAsync(id);
            if (bill == null)
                return NotFound();
            return Ok(bill);
        }

        [HttpPost]
        public async Task<ActionResult<ScannedBill>> CreateBill([FromBody] ScannedBill bill)
        {
            // Generate an Id if not provided
            if (string.IsNullOrEmpty(bill.Id))
            {
                bill.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
            }

            await _repository.CreateBillAsync(bill);
            return CreatedAtAction(nameof(GetBillById), new { id = bill.Id }, bill);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBill(string id, [FromBody] ScannedBill billIn)
        {
            var existingBill = await _repository.GetBillByIdAsync(id);
            if (existingBill == null)
                return NotFound();

            billIn.Id = id; // Ensure the Id matches the route parameter
            await _repository.UpdateBillAsync(id, billIn);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBill(string id)
        {
            var bill = await _repository.GetBillByIdAsync(id);
            if (bill == null)
                return NotFound();

            await _repository.DeleteBillAsync(id);
            return NoContent();
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadBillImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Validate file type and size
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Invalid file type. Only JPEG and PNG are allowed.");

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("File size exceeds 5MB limit.");

            // Save the image temporarily
            var tempPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + extension);
            try
            {
                using (var stream = new FileStream(tempPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Extract structured JSON using Gemini 2.0 Flash-Lite
                string geminiResponse = await ExtractJsonFromImageAsync(tempPath);

                // Deserialize the JSON into ScannedBill
                var scannedBill = DeserializeBillFromJson(geminiResponse);

                // Validate required fields
                if (string.IsNullOrEmpty(scannedBill.Vendor) || scannedBill.TotalAmount == 0)
                    return BadRequest("Failed to extract required fields (Vendor and TotalAmount).");

                // Generate an Id if not provided
                if (string.IsNullOrEmpty(scannedBill.Id))
                {
                    scannedBill.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
                }

                // Save to MongoDB using the repository
                await _repository.CreateBillAsync(scannedBill);
                return CreatedAtAction(nameof(GetBillById), new { id = scannedBill.Id }, scannedBill);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error processing bill image: {ex.Message}");
            }
            finally
            {
                if (System.IO.File.Exists(tempPath))
                    System.IO.File.Delete(tempPath);
            }
        }

        private async Task<string> ExtractJsonFromImageAsync(string imagePath)
        {
            using var client = new HttpClient();
            string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={_geminiApiKey}";

            // Read and encode the image as Base64
            byte[] imageBytes = await System.IO.File.ReadAllBytesAsync(imagePath);
            string base64Image = Convert.ToBase64String(imageBytes);

            // Prompt to extract data as JSON
            string prompt = @"
Extract the following fields from this bill image and return them in JSON format. The structure should match this example:
{
  ""vendor"": ""string"",
  ""date"": ""yyyy-MM-ddTHH:mm:ss"", // ISO 8601 format
  ""totalAmount"": number,
  ""paymentMethod"": ""string"",
  ""lineItems"": [
    {
      ""itemName"": ""string"",
      ""quantity"": number,
      ""unitPrice"": number,
      ""totalPrice"": number
    }
  ]
}
Fields to extract:
- vendor: The name of the vendor or store.
- date: The date on the bill in MM/dd/yyyy format, converted to ISO 8601.
- totalAmount: The total amount due (numeric, e.g., 500.00).
- paymentMethod: The payment method used (e.g., Credit Card, Cash).
- lineItems: An array of items, each with itemName, quantity, unitPrice, and totalPrice.
If a field cannot be extracted, set it to null or an empty value as appropriate.
Return only the JSON object, without any additional text or markdown, code blocks, backticks, or explanations. Do not wrap the JSON in ```json or any other markers. Ensure the output is valid JSON that can be directly parsed without any modifications.
";


            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new Object[]
                        {
                            new { text = prompt },
                            new
                            {
                                inlineData = new
                                {
                                    mimeType = "image/jpeg", // Adjust based on image type
                                    data = base64Image
                                }
                            }
                        }
                    }
                }
            };

            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(endpoint, content);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        private ScannedBill DeserializeBillFromJson(string geminiResponse)
        {
            try
            {
                var responseJson = JsonConvert.DeserializeObject<dynamic>(geminiResponse);
                string extractedJson = responseJson?.candidates?[0]?.content?.parts?[0]?.text?.ToString();

                if (string.IsNullOrEmpty(extractedJson))
                    throw new Exception("No data extracted from the image.");

                // Log the raw extracted JSON for debugging
                Console.WriteLine("Raw Extracted JSON: " + extractedJson);

                // Clean up the extractedJson by removing markdown code block markers
                extractedJson = extractedJson.Trim(); // Remove leading/trailing whitespace and newlines
                if (extractedJson.StartsWith("```json"))
                {
                    // Remove ```json and trailing ```
                    extractedJson = extractedJson.Substring(7); // Skip ```json\n
                    extractedJson = extractedJson.Trim(); // Remove any remaining whitespace/newlines
                    if (extractedJson.EndsWith("```"))
                    {
                        extractedJson = extractedJson.Substring(0, extractedJson.Length - 3).Trim();
                    }
                }

                // Log the cleaned JSON for debugging
                Console.WriteLine("Cleaned JSON: " + extractedJson);

                // Deserialize the cleaned JSON into ScannedBill
                var scannedBill = JsonConvert.DeserializeObject<ScannedBill>(extractedJson);
                return scannedBill;
            }
            catch (JsonException ex)
            {
                throw new Exception($"Failed to deserialize Gemini response: {ex.Message}");
            }
        }
    }
}