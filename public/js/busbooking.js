

document.addEventListener("DOMContentLoaded", () => {
  let isLeaderboardLoaded = false;
  let form = document.getElementById("appointmentForm");
  const ulElements = document.querySelector("ul");

  // Fetch all existing entries
  const fetchData = () => {
    axios.get("http://localhost:5000/appointmentData", { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        console.log(response.data)
        // Clear existing list
        ulElements.innerHTML = "";
        // Iterate through all products and create list items
        response.data.expensedata.forEach((product) => {
          let liitem = document.createElement("li");
          liitem.innerHTML = `${product.expense} - ${product.description} - ${product.type} 
            <button class="edt" type="button" onclick="editEntry(${product.id}, '${product.expense}', '${product.description}', '${product.type}')">edit</button> 
            <button class="del" type="button" onclick="deleteEntry(${product.id})">delete</button>`;
          liitem.classList.add("bookings");
          ulElements.appendChild(liitem);
        });
        if (response.data.ispremium == true) {

          premiumbutton.outerHTML = '<span id="premium-text">You are a Premium User</span>';
          premiumbutton.innerHTML = 'you are premium user'

          const leaderboardButton = document.createElement("button");
          // Set the button text
          leaderboardButton.textContent = "Show Leaderboard";
          // Set an id for the button (optional, for styling or further functionality)
          leaderboardButton.id = "leaderboard";
          // Append the button to the body
          document.body.appendChild(leaderboardButton);
          let leaderboardbutton = document.getElementById("leaderboard");
          leaderboardButton.addEventListener("click", (e) => {
            if (isLeaderboardLoaded) {
              alert("Leaderboard is already displayed!");
              return;
            }
            axios.get("http://localhost:5000/rankwiseexpense", { headers: { token: localStorage.getItem("user jwt") } })
              .then(response => {
                console.log(response.data)
                let leaderboardul = document.createElement("ul");
                leaderboardul.id = "leaderboardul";
                document.body.appendChild(leaderboardul);
                let leaderboardselected = document.getElementById("leaderboardul");
                leaderboardselected.innerHTML = "";
                for (let i = 0; i < 5; i++) {
                  let product = response.data.expensedata[i];
                  let liitem = document.createElement("li");
                  liitem.innerHTML = `${product.expense} - ${product.description} - ${product.expenseuser.name}`
                  liitem.classList.add("bookings1");
                  leaderboardselected.appendChild(liitem);
                }
              })
            isLeaderboardLoaded = true;
          })
        }
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
        isLeaderboardLoaded = false;
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
          "order_id": response.data.order.id,// Enter the Key ID generated from the Dashboard
          // "amount": response.data.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          "currency": "INR",
          "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
          "handler": async function (response) {
            console.log("razorwood", response);
            await axios.post('http://localhost:5000/purchase/updatetransectionstatus', {

              //this are not passed correctly  to next middleware 
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id
            }, { headers: { token: localStorage.getItem("user jwt") } }).then(res => {
              localStorage.setItem("user jwt", res.data.usertoken)


            })
            alert("you are premium user now")
            premiumbutton.outerHTML = '<span id="premium-text">You are a Premium User</span>';
            premiumbutton.innerHTML = 'you are premium user'
            console.log("you are premium user indeed")
          },
          "modal": {
            "ondismiss": async function () {
              try {
                await axios.post('http://localhost:5000/purchase/updatetransectionstatus', {
                  order_id: options.order_id,
                  payment_status: 'FAILED'
                }, {
                  headers: { token: localStorage.getItem("user jwt") }
                });
                alert("Payment cancelled or failed. Please try again.");
              } catch (error) {
                console.error("Error updating failed payment status:", error);
              }
            }
          }
        }
        var rzp1 = new Razorpay(options);
        rzp1.open();
      })
  })
});