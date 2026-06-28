import createQueryClient from "openapi-react-query";
import client from "./client";

const $api = createQueryClient(client);

export default $api;
