// Announcement content
export const ANNOUNCEMENT_CONTENT = `
  <p>Welcome to Shotti Kotha! Please follow our community guidelines when sharing your experiences:</p>
  <ul class="list-disc pl-5 mt-2 space-y-1">
    <li>Be respectful and honest in your stories</li>
    <li>Avoid sharing personally identifiable information</li>
    <li>Focus on the experience rather than attacking individuals</li>
  </ul>
  <p class="mt-2">Check out our <a href="/guidelines" class="text-primary underline">full guidelines</a> for more information.</p>
`

// Quill editor configuration
export const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
}

export const QUILL_FORMATS = ["header", "bold", "italic", "underline", "strike", "blockquote", "list", "link"]
