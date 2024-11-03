import fs from "fs";
import path from "path";
import matter from "gray-matter";

const directoryPath = "./src/content/diary"; // Path to your markdown files

// Function to escape SQL strings by doubling single quotes
function escapeSQLString(str) {
  return str.replace(/'/g, "''");
}

// Function to generate SQL insert statements
function generateSQLInsertStatements() {
  const files = fs.readdirSync(directoryPath);
  const insertStatements = [];

  files.forEach((file, index) => {
    if (path.extname(file) === ".md") {
      const content = fs.readFileSync(path.join(directoryPath, file), "utf8");
      const parsed = matter(content);

      const title = escapeSQLString(parsed.data.title);
      const date = Date.parse(parsed.data.date); // Convert to timestamp
      const body = escapeSQLString(parsed.content);

      // Create SQL insert statement
      const sql = `INSERT INTO diary_entries (id, date, body, title) VALUES (${index + 1}, ${date}, '${body}', '${title}');`;
      insertStatements.push(sql);
    }
  });

  return insertStatements.join("\n");
}

// Run and print the result
console.log(generateSQLInsertStatements());
