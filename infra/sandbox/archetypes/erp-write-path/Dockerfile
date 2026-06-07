ARG BASE_IMAGE=sda-sandbox-base:latest
FROM ${BASE_IMAGE}

ARG DATABASE_NAME=deskorders
ARG APP_ROLE=order_writer
ARG APP_PASSWORD=local_order_writer_password
ARG TABLE_NAME=orders
ARG SEQUENCE_NAME=orders_id_seq

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql postgresql-client \
  && rm -rf /var/lib/apt/lists/* \
  && systemctl enable postgresql.service \
  && install -d -m 755 /opt/hackathon

COPY archetypes/erp-write-path/init-db.sh.template /tmp/init-db.sh
COPY archetypes/erp-write-path/break.sh.template /opt/hackathon/break.sh
COPY archetypes/erp-write-path/public-test.sh.template /opt/hackathon/public-test.sh
COPY archetypes/erp-write-path/case.json.template /opt/hackathon/case.json

RUN sed -i "s|__DATABASE_NAME__|${DATABASE_NAME}|g; s|__APP_ROLE__|${APP_ROLE}|g; s|__APP_PASSWORD__|${APP_PASSWORD}|g; s|__TABLE_NAME__|${TABLE_NAME}|g; s|__SEQUENCE_NAME__|${SEQUENCE_NAME}|g" \
      /tmp/init-db.sh /opt/hackathon/break.sh /opt/hackathon/public-test.sh /opt/hackathon/case.json \
  && chmod +x /tmp/init-db.sh /opt/hackathon/break.sh /opt/hackathon/public-test.sh \
  && /tmp/init-db.sh

STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
