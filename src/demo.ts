import { GetInteraction, ParamsObject, Method } from "./interaction";

type DemoModel = { name: string };

const getInteraction: GetInteraction<
  DemoModel,
  ParamsObject.PathParams<{ id: string }>
> = {
  description: "sdlfihjds",
  withRequest: {
    path: "/api/demo",
    headers: {
      "content-type": "application/json",
    },
    params: {
      path: { id: "someid" },
      headers: {},
      query: {},
    },
  },
  responseExamples: {
    success: {
      body: { name: "somename" },
      description: "normal case",
      headers: { "content-type": "application/json" },
      status: 200,
    },
    fail: {
      description: "failure",
      status: 400,
    },
  },
};

const accessor = async (
  method: Method,
  url: string,
  body: any,
  headers: ParamsObject.ParamsValues
) => {
  return { data: "sdiölfjslidf", status: 200 };
};

const getResult = GetInteraction(
  getInteraction,
  {
    headers: {},
    query: {},
    path: { id: "someid" },
  },
  accessor
);
