FROM public.ecr.aws/nginx/nginx:1.29.3

RUN rm /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY ./production.conf /etc/nginx/nginx.conf

COPY ./robots.txt /var/www/html/robots.txt
