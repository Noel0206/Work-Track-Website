document.getElementById('downloadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const urlInput = document.getElementById('urlInput');
    const statusDiv = document.getElementById('status');
    const url = urlInput.value.trim();

    if (!url) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid URL',
            text: 'Please enter a valid URL',
            confirmButtonColor: '#0d6efd'
        });
        return;
    }

    try {
        statusDiv.className = '';
        statusDiv.textContent = 'Processing Google Drive link...';

        // Check if it's a Google Drive link
        if (url.includes('drive.google.com')) {
            // Extract the file ID from the Google Drive URL
            const fileId = url.match(/\/d\/(.*?)\/view/)?.[1];
            
            if (!fileId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Google Drive Link',
                    text: 'Please make sure you copied the complete Google Drive link',
                    confirmButtonColor: '#0d6efd'
                });
                return;
            }

            // Create direct download link
            const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            
            // Show success message before opening new tab
            await Swal.fire({
                icon: 'success',
                title: 'Opening Download',
                text: 'The download will open in a new tab',
                confirmButtonColor: '#0d6efd'
            });
            
            // Open in new tab since Google Drive requires user interaction
            window.open(directDownloadUrl, '_blank');
            
            statusDiv.className = 'success';
            statusDiv.textContent = 'Opening download in new tab...';
            urlInput.value = '';
            return;
        }

        // For non-Google Drive links, use the original download logic
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'cors'
            });
            
            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: `Cannot access this URL (Status: ${response.status}). The server might be blocking the request.`,
                    confirmButtonColor: '#0d6efd'
                });
                return;
            }

            const downloadResponse = await fetch(url, {
                mode: 'cors'
            });

            if (!downloadResponse.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Download Failed',
                    text: `Download failed (Status: ${downloadResponse.status}). Please try a different URL.`,
                    confirmButtonColor: '#0d6efd'
                });
                return;
            }

            const blob = await downloadResponse.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            const filename = url.split('/').pop() || 'downloaded-file';
            
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            await Swal.fire({
                icon: 'success',
                title: 'Download Complete',
                text: 'Your file has been downloaded successfully!',
                confirmButtonColor: '#0d6efd'
            });

            statusDiv.className = 'success';
            statusDiv.textContent = 'Download completed successfully!';
            
            urlInput.value = '';
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Security Restriction',
                text: 'Cannot access this URL directly due to security restrictions. Try using a different URL or a direct file link.',
                confirmButtonColor: '#0d6efd'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Download Error',
            text: error.message,
            confirmButtonColor: '#0d6efd'
        });
        
        statusDiv.className = 'error';
        statusDiv.textContent = `Error: ${error.message}`;
        console.error('Download error:', error);
    }
}); 