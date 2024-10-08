# Use the official Node.js 20.17.0 image
FROM node:20.17.0

# Set the working directory inside the container
WORKDIR /backed

# Copy package.json and package-lock.json from the backend folder to the working directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY backend/ .

# Expose the port your application runs on
EXPOSE 3060

# Command to run your application
CMD ["node", "index.js"]
