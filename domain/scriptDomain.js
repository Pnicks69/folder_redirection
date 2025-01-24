const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const sendButton = document.getElementById('send-button');
const fileInfo = document.getElementById('file-info');
const fileListBody = document.getElementById('file-list-body');

let selectedFile = null;

// Handle drag-and-drop file selection
dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => {
  selectedFile = event.target.files[0];

  if (selectedFile) {
    fileInfo.innerHTML = `Selected file: <strong>${selectedFile.name}</strong>`;
    sendButton.disabled = false;
  } else {
    fileInfo.innerHTML = 'No file selected.';
    sendButton.disabled = true;
  }
});

// Handle form submission for file upload
document.getElementById('upload-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!selectedFile) {
    alert('Please select a file before uploading.');
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => {
        throw new Error(`Server responded with a non-JSON error: ${response.statusText}`);
      });
      throw new Error(`Failed to upload file: ${errorDetails.error || response.statusText}`);
    }

    const data = await response.json();

    if (data.url) {
      alert('File uploaded successfully');
      addFileToTable(data.url, selectedFile.name);
    } else {
      throw new Error('Unexpected server response');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('An error occurred while uploading the file.');
  }
});

// Add file to the table in the dashboard
function addFileToTable(fileUrl, fileName) {
  const newRow = document.createElement('tr');

  // Create a cell for the file preview (image or link)
  const fileCell = document.createElement('td');
  if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i)) {
    const img = document.createElement('img');
    img.src = fileUrl;
    img.alt = fileName;
    img.style.width = '100px';
    img.style.height = 'auto';
    fileCell.appendChild(img);
  } else {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.textContent = fileName;
    fileCell.appendChild(link);
  }

  // Add the cells to the new row
  newRow.appendChild(fileCell);
  fileListBody.appendChild(newRow);
}

// Fetch and display the list of files on load
async function fetchFiles() {
  try {
    const response = await fetch('http://localhost:5000/get-files');

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => {
        throw new Error(`Server responded with a non-JSON error: ${response.statusText}`);
      });
      throw new Error(`Failed to fetch files: ${errorDetails.error || response.statusText}`);
    }

    const files = await response.json(); // Parse the JSON response
    files.forEach((file) => addFileToTable(file.secure_url, file.public_id));
  } catch (error) {
    console.error('Error fetching files:', error);
    alert(`An error occurred while fetching files: ${error.message}`);
  }
}

// Initialize by fetching files
fetchFiles();
