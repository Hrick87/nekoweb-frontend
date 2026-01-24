// TODO Change for production
// const API_BASE = tailScale VPN
const API_BASE = "https://raspberrypi.tailb5c308.ts.net";

/* 
* Interfaces allow us to Shape a return value. API calls have a type of any by default
* but if narrow its return type to something, we can then begin typing it.
* Thus we have narrowed fetchResponse.json() to return Promise<Blog_Comments[]> */
interface Blog_Comment {
    author: string;
    text: string;
}

/* protect against XSS */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* reusable Comment Render function */
function renderComments(comment_list: HTMLElement, comments: Blog_Comment[]): void {
    if (comments.length === 0) {
        comment_list.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
    } else {
        comment_list.innerHTML = comments.map((blog_comment_element: Blog_Comment): string => 
            `<p><b>${escapeHtml(blog_comment_element.author)}</b><br> ${escapeHtml(blog_comment_element.text)}</p>`
        ).join("");
    }
}

document.querySelectorAll<HTMLElement>(".comments").forEach(section => {
    const postId : string | undefined = section.dataset.postId;
    if (typeof postId === "undefined"){
        throw new Error("PostId: ${postId} was undefined")
    }
    const comment_list : HTMLElement = section.querySelector<HTMLElement>(".comment-list")!;
    const form : HTMLFormElement = section.querySelector<HTMLFormElement>(".comment-form")!;
    /*
    * Fetch uses async and await
    * It attempts to fetch whatever file you pass as a str, URL, or Request
    * then it populates the argument of the .then() call. In this case
    * our fetchResponse argument. There is no need to explicitly type this as it
    * already has very defined inputs and a single return type */
    fetch(`${API_BASE}/comments?post=${encodeURIComponent(postId)}`)
    /* 
    * Note: I have explicitly typed this fetchResponse argument for beginner friendly reading, 
    * but typeScript can usually infer the type of Promise it is. 
    * This then returns the value after the => which is a javaScript Promise of an Array of 
    * our Interface we declared above */
    .then((fetchResponse: Response): Promise<Blog_Comment[]> => {
        if (!fetchResponse.ok) {
            // This handles HTTP errors (404, 500, etc.)
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        return fetchResponse.json()}
    )
    /*
    * Promises always resolve in the next then call. Thus the type of our argument comments becomes Blog_Comments[]
    * This is our last call so now we resolve what we want to do with our argument. In a lot of cases, its to alter
    * our HTML in some way programmatically. */
    .then((comments : Blog_Comment[]) => {
        if(comment_list === null) {
            throw new Error("comment-list html element not found.");
        }
        renderComments(comment_list, comments);
    })
    // Use this block to catch any errors that may occur with the above processes
    // Unknown types cannot be used to do anything
    .catch((error: unknown) : void => { 
        console.error("ERROR: ", error);
        comment_list.innerHTML = "<p>Failed to load comments. Please try again later.</p>";
    });

    try {
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const formData : FormData = new FormData(form);

            const author : FormDataEntryValue | null = formData.get("author");
            if (author === null) {
                throw new Error("Author of comment is missing.\n")
            }

            const text : FormDataEntryValue | null = formData.get("text");
            if (text === null) {
                throw new Error("Text of comment is missing.\n")
            }

            const response : Response = await fetch(`${API_BASE}/comments`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    post: postId, author, text
                })
            });
            if(!response.ok){
                alert("Failed to post comment.");
                return;
            }

            if (typeof author === "string" && typeof text == "string") {
                const newComment: Blog_Comment = { author, text };
            }
            else {
                throw new Error("Either author or comment of a post was not a typeof string")
            }

            // Remove "No comments yet" if present
            if (comment_list.textContent?.includes("No comments yet. Be the first to comment!")) {
                comment_list.innerHTML = "";
            }
            
            comment_list.insertAdjacentHTML(
                "beforeend",
                `<p><b>${author}</b><br>${text}</p>`
            );

            // Reset form
            form.reset();
        });
    }
    catch(error: unknown) { 
        console.error("ERROR: ", error);
    }
}
);