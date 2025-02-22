# Very basic AWS S3 file uploader

AWS S3 uploader for quick image/video sharing. Supports any file extension.

### Installation

Create `.env` file. Then install dependencies:
```
npm install
```

Usage:
```
make upload/file FILE=/path/to/file
```

It will upload the file to an S3 bucket and copy its url directly to the clipboard for quick sharing capability.