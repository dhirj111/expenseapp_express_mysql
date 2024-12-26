document.addEventListener("DOMContentLoaded", () => {
  let form = document.getElementById("appointmentForm");
  const ulElements = document.querySelector("ul");

  // Fetch all existing entries
  const fetchData = () => {
    axios
      .get("http://localhost:5000/appointmentData", { headers: { token: localStorage.getItem("user jwt") } })
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
});