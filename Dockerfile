# Use the official Node.js v20.17.0 image
FROM node:20.17.0

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3070

# Command to run your application (specifying the index.js entry point)
CMD [ "node", "intranet/backend/index.js" ]
