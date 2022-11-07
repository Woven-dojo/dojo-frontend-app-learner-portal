FROM nginx
COPY ./dist /usr/share/nginx/html/lms
COPY ./app.conf /etc/nginx/templates/app.conf.template
