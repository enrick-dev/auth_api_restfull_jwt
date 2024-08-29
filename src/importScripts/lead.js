// scripts/import-script.js

    const backendUrl = 'http://localhost:9090/leads/save-lead';
  
    function sendData(data) {
      
      const { token } = data

      fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${token}`
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  
    // document.addEventListener('DOMContentLoaded', function() {
    //   form = document.querySelector('form');
    //   if (form) {
    //     form.addEventListener('submit', function(event) {
    //       event.preventDefault();
    //       const formData = new FormData(form);
    //       const data = {};
    //       formData.forEach((value, key) => {
    //         data[key] = value;
    //       });
    //       sendData(data);
    //     });
    //   }
    // });

  
