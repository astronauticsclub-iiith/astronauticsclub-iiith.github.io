import User from "@/models/User";

// Helper function to populate author details
export async function populateAuthorDetails(blogs: Array<Record<string, unknown>>) {
  const authorEmails = [
    ...new Set(blogs.map((blog) => (blog.author as { email: string }).email)),
  ];
  const authors = await User.find({ email: { $in: authorEmails } }).lean();

  const authorMap = new Map();
  authors.forEach((author) => {
    authorMap.set(author.email, {
      name: author.name || "Anonymous",
      avatar: author.avatar,
      bio: author.bio || "",
      email: author.email,
    });
  });

  return blogs.map((blog) => ({
    ...blog,
    author: authorMap.get((blog.author as { email: string }).email) || {
      name: "Anonymous",
      avatar: "",
      bio: "",
      email: (blog.author as { email: string }).email,
    },
  }));
}