console.log("hitting reports.js")
document.addEventListener("DOMContentLoaded", () => {
  console.log(" sdf f s f js")
  let listhead = document.getElementById("Expenses");
  console.log(listhead)

  // console.log(userDetails)
  axios
    .get("http://localhost:5000/datedexpense")
    .then((response) => {
      let expensesum = 0;
      console.log(response.data.expensedata)
      for (let i = 0; i < response.data.expensedata.length; i++) {
        let liitem = document.createElement("tr");
        liitem.innerHTML = `<td>${response.data.expensedata[i].formatted_date}</td>
          <td>${response.data.expensedata[i].description}</td>
          <td>${response.data.expensedata[i].type}</td>
          <td></td>
          <td>${response.data.expensedata[i].expense}</td>`
        // liitem.classList.add("bookings1");
        listhead.appendChild(liitem);
        expensesum = expensesum + response.data.expensedata[i].expense
      }
      let liitem = document.createElement("tr");
      liitem.classList.add("savings");
      liitem.innerHTML = `<td colspan="3"></td>
            <td>₹ 0</td>
            <td>₹ ${expensesum}</td>`
      listhead.appendChild(liitem);
      let savings = 0 - expensesum
      let liitem2 = document.createElement("tr");
      liitem2.classList.add("savings");
      liitem2.innerHTML = `<tr class="savings">
            <td colspan="4">Savings = </td>
            <td>₹ $            {savings}</td>
          </tr>`
      listhead.appendChild(liitem2);
    })
    .catch((error) => {
      console.error('Error details:', error.response ? error.response.data : error.message);
      alert('Failed to create product');
    });



})