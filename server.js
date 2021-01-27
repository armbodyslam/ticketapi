const express = require("express");
const app = express();
const tickets = require("./db.json");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//index
app.get("/", (req, res) => {
  res.send("Welcome to the ticket api v.0.1");
});

//เรียกดู ticket ทั้งหมด
app.get("/tickets", (req, res) => {
  res.json(tickets);
});

//เรียกดู ticket
app.get("/tickets/:id", (req, res) => {
  let id = req.params.id;
  let tk = tickets.find((tk) => tk.id === req.params.id);
  if (tk) {
    res.json(tk);
  } else {
    res.status(404).json("not found");
  }
  //res.json(tickets.find((tk) => tk.id === req.params.id));
});

//create ticket
app.post("/tickets", (req, res) => {
  try {
    //เช็ค id
    let id = 1;
    if (tickets.length > 1) {
      let lastTicket = tickets[tickets.length - 1];
      id = parseInt(lastTicket.id) + 1;
    }
    let lastIDTicket = "" + id;
    let body = req.body;
    //console.log(body)
    let name = body.name ? body.name : "";
    let desc = body.desc ? body.desc : "";
    let contact = body.contact ? body.contact : "";
    let createDate = new Date();
    let jsonCreateDate = createDate.toJSON();
    let status = "pending";
    let ticket = {
      id: lastIDTicket,
      name,
      desc,
      contact,
      status,
      create_date: jsonCreateDate,
      last_update: "",
    };
    tickets.push(ticket);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json("error");
  }

  //tickets.push(req.body);
  //res.status(201).json(req.body);
});

//update status ticket A=accepted P=pending RE=resolved RJ=reject
app.put("/tickets/:id", (req, res) => {
  const tkIndex = tickets.findIndex((tk) => tk.id === req.params.id);
  if (tkIndex >= 0) {
    let status = req.body.status;
    if (status) {
      let lu = new Date();
      switch (status) {
        case "A":
          tickets[tkIndex].status = "accepted";
          tickets[tkIndex].last_update = lu.toJSON();
          res.status(200).json(tickets[tkIndex]);
          // code block
          break;
        case "P":
          //let lu = new Date();
          tickets[tkIndex].status = "pending";
          tickets[tkIndex].last_update = lu.toJSON();
          res.status(200).json(tickets[tkIndex]);
          // code block
          break;
        case "RE":
          //let lu = new Date();
          tickets[tkIndex].status = "resolved";
          tickets[tkIndex].last_update = lu.toJSON();
          res.status(200).json(tickets[tkIndex]);
          break;
        case "RJ":
          //let lu = new Date();
          tickets[tkIndex].status = "reject";
          tickets[tkIndex].last_update = lu.toJSON();
          res.status(200).json(tickets[tkIndex]);
          break;
        default:
          // code block
          res.status(400).json("status is not correct");
      }
    } else {
      res.status(400).json("status is null");
    }
  } else {
    res.status(404).json("not found");
  }
  //res.json(Object.assign(books[updateIndex], req.body))
});

app.get("/tk/paging", (req, res) => {
  try {
    let body = req.body;
    let ticketQuery = body.ticket;
    let { limit, offset, sort } = body.paging;
    let { status, create_date_from, create_date_to } = ticketQuery;
    let result = tickets;
    if (status) {
      result = result.filter((tk) => {
        return (tk.status = status);
      });
    }
    if (create_date_from && create_date_to) {
      result = result.filter((tk) => {
        let dateFrom = create_date_from;
        let dateTo = create_date_to;
        let dateCheck = tk.create_date;

        let from = new Date(dateFrom);
        let to = new Date(dateTo);
        let check = new Date(dateCheck);

        return check > from && check < to;
      });
    } else if (create_date_from && !create_date_to) {
      result = result.filter((tk) => {
        return (tk.create_date = create_date_from);
      });
    } else if (create_date_to && !create_date_from) {
      result = result.filter((tk) => {
        return (tk.create_date = create_date_to);
      });
    }
    let count = result.length;
    let skip = parseInt(offset);
    let limitI = parseInt(limit);
    let to = skip + limitI;
    let page = Math.ceil((offset + 1) / limit);
    let total_pages = Math.ceil(count / limit);
    if (result.length < to) {
      to = result.length;
    }
    let resl = result.slice(skip, to);
    let resultWithPage = {
      tickets: resl,
      pagination: {
        page,
        total_pages,
      },
    };

    res.status(200).json(resultWithPage);
  } catch (error) {
    console.log(error);
    res.status(400).json("error");
  }
});

app.listen(3000, () => {
  console.log("Start server at port 3000.");
});
