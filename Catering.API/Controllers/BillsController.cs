using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class BillsController : ControllerBase
{
    private readonly IBillRepository _repository;

    public BillsController(IBillRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ScannedBill>>> GetBills()
    {
        return Ok(await _repository.GetAllBillsAsync());
    }

    [HttpPost]
    public async Task<ActionResult<ScannedBill>> CreateBill(ScannedBill bill)
    {
        await _repository.CreateBillAsync(bill);
        return CreatedAtAction(nameof(GetBills), new { id = bill.Id }, bill);
    }
}