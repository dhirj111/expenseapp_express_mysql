

document.addEventListener("DOMContentLoaded", () => {
  let form = document.getElementById("appointmentForm");
  const ulElements = document.querySelector("ul");

  // Fetch all existing entries
  const fetchData = () => {
    axios.get("http://localhost:5000/appointmentData", { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        // Clear existing list
        ulElements.innerHTML = "";
        // Iterate through all products and create list items
        response.data.forEach((product) => {
          let liitem = document.createElement("li");
          liitem.innerHTML = `${product.expense} - ${product.description} - ${product.type} 
            <button class="edt" type="button" onclick="editEntry(${product.id}, '${product.expense}', '${product.description}', '${product.type}')">edit</button> 
            <button class="del" type="button" onclick="deleteEntry(${product.id})">delete</button>`;
          liitem.classList.add("bookings");
          ulElements.appendChild(liitem);
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch bookings');
      });
  };

  // Fetch data when DOM is loaded
  fetchData();

  // Default form submission handler
  const defaultFormSubmit = (event) => {
    event.preventDefault();
    let selectElement = document.querySelector("#type");

    //stored value in category
    let etype =
      selectElement.options[selectElement.options.selectedIndex].textContent;
    console.log(etype)
    const userDetails = {
      expense: event.target.expense.value,
      description: event.target.description.value,
      type: etype,
    };
    console.log(userDetails)
    axios
      .post("http://localhost:5000/appointmentData", userDetails, { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        alert('Product created successfully!');
        fetchData(); // Refresh the list
        form.reset(); // Clear the form
      })
      .catch((error) => {
        console.error('Error details:', error.response ? error.response.data : error.message);
        alert('Failed to create product');
      });
  };

  // Set the default form submit handler
  form.addEventListener("submit", defaultFormSubmit);

  // Delete entry function
  window.deleteEntry = (id) => {
    console.log("dele etet  is           cl i     c ked")
    axios
      .delete(`http://localhost:5000/appointmentData/${id}`, { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        console.log('Data Deleted Successfully');
        fetchData(); // Refresh the list
      })
      .catch((error) => {
        console.error("Delete error", error);
        alert('Failed to delete product');
      });
  };

  // Edit entry function
  window.editEntry = (id, expense, description, type) => {
    // Populate form with existing data
    document.getElementById("expense").value = expense;
    document.getElementById("description").value = description;
    document.getElementById("type").value = type;

    // Remove the current submit event listener
    form.removeEventListener("submit", defaultFormSubmit);

    // Create a new submit handler for editing
    const editFormSubmit = (event) => {
      event.preventDefault();
      let selectElement = document.querySelector("#type");

      //stored value in category
      let etype =
        selectElement.options[selectElement.options.selectedIndex].textContent;
      const updatedDetails = {
        expense: document.getElementById("expense").value,
        description: document.getElementById("description").value,
        type: etype
      };
      //below we are passing two things one is id ,and another is objects as updateddetails
      axios
        .put(`http://localhost:5000/appointmentData/${id}`, updatedDetails)
        .then((response) => {
          alert('Product updated successfully!');
          fetchData(); // Refresh the list
          form.reset(); // Clear the form

          // Remove the edit submit listener and restore default
          form.removeEventListener("submit", editFormSubmit);
          form.addEventListener("submit", defaultFormSubmit);
        })
        .catch((error) => {
          console.error("Update error", error);
          alert('Failed to update product');
        });
    };

    // Add the edit submit listener
    form.addEventListener("submit", editFormSubmit);
  };
  let premiumbutton = document.getElementById("premium");
  premiumbutton.addEventListener("click", async (event) => {
    event.preventDefault();
    axios.get('http://localhost:5000/purchase/premiummembership', { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        console.log("res112233", response.data)
        let options = {
          "key": response.data.key_id, 
          "order_id":response.data.order.id ,// Enter the Key ID generated from the Dashboard
          // "amount": response.data.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          "currency": "INR",
          "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
          "handler": async function (response) {
            console.log("razorwood", response);
            await axios.post('http://localhost:5000/purchase/updatetransectionstatus', {

              //this are not passed correctly  to next middleware 
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id
            }, { headers: { token: localStorage.getItem("user jwt") } })
            alert("you are premium user now")
            console.log("you are premium user inde        ed")
          }
        }
        var rzp1 = new Razorpay(options);
        rzp1.open();
      })
  })
});