// scriptDashboard.js

// Fetch and display files from Cloudinary
async function loadFiles() {
    try {
        // Make the request to your backend to fetch files
        const response = await axios.get('http://localhost:5000/get-files');  // Your backend endpoint
        
        const files = response.data.resources;
        const fileListBody = document.getElementById('file-list-body');

        // Clear the file list before adding new files
        fileListBody.innerHTML = '';

        // Populate the file list table with the fetched files
        files.forEach((file) => {
            const row = document.createElement('tr');

            // File name cell
            const fileNameCell = document.createElement('td');
            fileNameCell.textContent = file.public_id;

            // File size cell
            const fileSizeCell = document.createElement('td');
            fileSizeCell.textContent = (file.bytes / 1024).toFixed(2) + ' KB';

            // File type cell
            const fileTypeCell = document.createElement('td');
            fileTypeCell.textContent = file.format;

            // Action buttons cell (View and Delete)
            const actionsCell = document.createElement('td');
            const viewButton = document.createElement('button');
            viewButton.textContent = 'View';
            viewButton.classList.add('view-button');
            viewButton.onclick = () => window.open(file.url, '_blank');

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.onclick = async () => {
                try {
                    // Call backend to delete the file (proxy to Cloudinary)
                    await axios.delete('http://localhost:5000/delete-file', { data: { public_id: file.public_id } });

                    // Remove the file from the table
                    fileListBody.removeChild(row);
                } catch (error) {
                    alert('Failed to delete the file');
                }
            };

            actionsCell.appendChild(viewButton);
            actionsCell.appendChild(deleteButton);

            row.appendChild(fileNameCell);
            row.appendChild(fileSizeCell);
            row.appendChild(fileTypeCell);
            row.appendChild(actionsCell);

            fileListBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching files from Cloudinary', error);
        alert('Failed to load files');
    }
}

// Load files when the page loads
window.addEventListener('DOMContentLoaded', loadFiles);

// File upload form handler
document.getElementById('upload-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById('file-input');
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.url) {
      // Now you can display the image in your dashboard
      alert('File uploaded successfully');
      addFileToTable(data.url);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
});

// Function to add uploaded file to the table
function addFileToTable(imageUrl) {
  const newRow = document.createElement('tr');
  const imageCell = document.createElement('td');
  const imageElement = document.createElement('img');
  imageElement.src = imageUrl;
  imageElement.style.width = '100px'; // Or any size you want
  imageCell.appendChild(imageElement);

  newRow.appendChild(imageCell);
  document.getElementById('file-list-body').appendChild(newRow);
}
