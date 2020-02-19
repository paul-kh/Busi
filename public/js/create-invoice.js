const orderIdEl = document.getElementById("order-id");
const payAmountEl = document.getElementById("pay-amount");
const discountAmountEl = document.getElementById("discount-amount");
const generateInvoiceBtnEl = document.getElementById("generate-btn");
const pdfBtnEl = document.getElementById("pdf-btn");
const searchBtnEl = document.getElementById("search-btn");
const subReportSectionContainer = document.getElementById("sub-report-section");
const orderSubReportContainer = document.getElementById("order-sub-report");

// search sales order
searchBtnEl.addEventListener("click", e => {
  axios.get(`/api/salesorders/${orderIdEl.value}`).then(order => {
    console.log(order);
    if (order.data.length === 0) {
      alert(`The sales order number ${orderIdEl.value} that you entered DOES NOT EXIST!`);
      orderIdEl.focus();
    } else {
      axios.get("/api/invoices").then(invoice => {
        // check if the order was issued with an existing invoice once already
        const existingInvoice = invoice.data.filter(invoice => invoice.salesorder_id === parseInt(orderIdEl.value));
        if (existingInvoice.length > 0) {
          alert(`Sorry, we cannot generate invoice with this sales order ${orderIdEl.value}! \nThe sales order was billed once already with inovice # ${existingInvoice[0].id}.`);
          // console.log("invoices: ", existingInvoice);
        } else {
          // show sub reports
          // render sub reports: sales order & payment
          renderSalesOrder(order.data[0], orderSubReportContainer);
          // generate invoice

          generateInvoice();
          // print PDF
        }
      })
    }
  });
});

// create invoice
function generateInvoice() {
  // add click event to button 'Generate Invoice'
  generateInvoiceBtnEl.addEventListener("click", e => {
    // ## validate input
    if (payAmountEl.value === "") {
      payAmountEl.value = 0;
    }
    if (discountAmountEl.value === "") {
      discountAmountEl.value = 0;
    }
    if (isNaN(payAmountEl.value) || isNaN(discountAmountEl.value)) {
      alert("Discount amount and Amount to Pay must be number!");
    } else {
      // 1. insert into invoice table
      // 2. insert into payment tablef
      axios
        .post("/api/invoices", {
          salesorder_id: orderIdEl.value,
          amount_paid: payAmountEl.value,
          discount: discountAmountEl.value
        })
        .then(function (inv) {
          // insert into payment table
          console.log("invoice: ", inv);
          axios
            .post("/api/payments", {
              invoice_id: inv.data.id,
              amount: payAmountEl.value
            })
            .then(function (pmt) {
              console.log("Payment: ", pmt);
              // update invoice summary
              axios.get(`/api/salesorders/${orderIdEl.value}`).then(order => {
                const invoiceNum = document.getElementById("invoice-number");
                const invoiceTotal = document.getElementById("invoice-total");
                const paidAmount = document.getElementById("paid-amount");
                const discount = document.getElementById("discounted-amount");
                const balanceDue = document.getElementById("balance-due");
                invoiceNum.innerHTML = inv.data.id;
                invoiceTotal.innerHTML = "$" + order.data[0].amount;
                paidAmount.innerHTML = "$" + inv.data.amount_paid;
                discount.innerHTML = "$" + inv.data.discount;
                balanceDue.innerHTML =
                  "$" +
                  (order.data[0].amount -
                    inv.data.amount_paid -
                    inv.data.discount);

                //create session storage of invoice id
                sessionStorage.setItem("id", inv.data.id);
                window.location.href = "./pdf-invoice.html";
              });
            });
        });
    }
  });
}

// Print PDF
pdfBtnEl.addEventListener("click", e => {
  // axios.post("/api/invoices",{salesorder_id: orderIdEl.value }).then(res => {
  // console.log(res);
  // });
});

function renderSalesOrder(order, orderSubReportContainer) {
  // show sub report section
  subReportSectionContainer.setAttribute("class", "container-fluid");
  // show result the found sales order
  orderSubReportContainer.innerHTML = `<div class="col-3">${order.id}</div>
                                         <div class="col-7"> ${order.description} </div>
                                         <div class="col-2 text-right"> ${order.amount}</div>`;
}
