# smart_hire_backend/Dockerfile — recommended
FROM node:20-alpine

# set production mode early so npm install skips devDependencies
ENV NODE_ENV=production
WORKDIR /usr/src/app

# avoid copying everything (use .dockerignore)
# copy only package manifest first for caching
COPY package*.json ./

# install only production deps (uses package-lock if present)
RUN npm install --production

# copy application source
COPY . .

# create uploads directory and ensure correct perms (optional)
RUN mkdir -p /usr/src/app/uploads

EXPOSE 5000

# default command — start the backend API
CMD ["node", "server.js"]
