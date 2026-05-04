import User from "@/models/User";

type Author = {
    name?: string;
    email: string;
};

function createAuthorDictionary(blogs: Array<Record<string, unknown>>) {
    return blogs.reduce(
        (authorDict, blog) => {
            const author = blog.author as Author;

            // Only add the entry if the author and email exist
            if (author && author.email) {
                authorDict[author.email] = author.name || "Anonymous";
            }

            return authorDict;
        },
        {} as Record<string, string>
    );
}

// Helper function to populate author details
export async function populateAuthorDetails(blogs: Array<Record<string, unknown>>) {
    const authorEmails = [
        ...new Set(blogs.map((blog) => (blog.author as { email: string }).email)),
    ];
    const authors = await User.find({ email: { $in: authorEmails } }).lean();

    const authDict = createAuthorDictionary(blogs);
    const authorMap = new Map();
    authors.forEach((author) => {
        authorMap.set(author.email, {
            name: author.name || authDict[author.email],
            avatar: author.avatar,
            bio: author.bio || "",
            email: author.email,
        });
    });

    return blogs.map((blog) => ({
        ...blog,
        author: authorMap.get((blog.author as { email: string }).email) || {
            name: authDict[(blog.author as { email: string }).email],
            avatar: "",
            bio: "",
            email: (blog.author as { email: string }).email,
        },
    }));
}
