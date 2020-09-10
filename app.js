const express = require("express");
const fs = require("fs");
const app = express();

//middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    Estado: "Bienvenido a mi API",
  });
});

//__dirname (me dice donde estoy ubicada en este momento)
//Para obtener el listado de gatitos
app.get("/gatitos", (req, res) => {
  //Leemos el archivo con una funcion asincrona, la cual lleva la direccion de archivo y un callback que contiene el error y la data
  fs.readFile(`${__dirname}/assets/cats.json`, (err, data) => {
    //Si ocurre un error como poner el nombre del archivo de forma incorrecta
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Ocurrio un error",
      });
    }
    //El json es un texto por lo cual hay que parsearlo
    const dataJSON = JSON.parse(data);
    //Se envia la respuesta en formato JSON
    res.json({
      status: "succes",
      data: dataJSON,
    });
  });
});

//para ver 1 gato en especifico
//Se debe definir una ruta. Podemos tener variables en el ruteo de express.
//Tenemos acceso al objeto request y dentro de ese objeto a la propiedad params

app.get("/gatitos/:id", (req, res) => {
  fs.readFile(`${__dirname}/assets/cats.json`, (err, data) => {
    const gatos = JSON.parse(data);
    //como req.params.id es un string tengo que convertirlo a numero
    const id = Number(req.params.id);
    //filtro el gato con el id igual al id enviado por parametro en la url
    const gatosFiltrados = gatos.filter((gato) => gato.id === id);

    //En caso de que solicite un gato que no existe en mi base de datos
    if (!gatosFiltrados.length) {
      return res.status(404).json({
        status: "fail",
        message: "Gato no encontrado",
      });
    }
    res.json({
      status: "succes",
      data: gatosFiltrados,
    });
  });
});

//Post
//Express requiere que para acceder al body pase por el middleware. Los middleware se usan con la palabra use
app.post("/gatitos", (req, res) => {
  //Leo el archivo de los gatitos. Creo el nuevo gato con lo que llega del body, le agrego el id y luego pusheo ese nuevo gato al array de gatitos
  fs.readFile(`${__dirname}/assets/cats.json`, (err, data) => {
    const dataJSON = JSON.parse(data);
    const nuevoGato = req.body;
    nuevoGato.id = dataJSON.length;
    dataJSON.push(req.body);

    //cuando escribo un archivo la funcion callback solo tiene el error.
    //Reescribo el archivo con el nuevo gato
    //Le envio al usuario el detalle del nuevo objeto creado en el array
    fs.writeFile(
      `${__dirname}/assets/cats.json`,
      JSON.stringify(dataJSON),
      (err) => {
        res.status(201).json({
          status: "succes",
          data: {
            nuevoGato,
            createAt: new Date(),
          },
        });
      }
    );
  });
});

//Update

app.put("/gatitos/:id", (req, res) => {
  //tengo que leer el archivo
  fs.readFile(`${__dirname}/assets/cats.json`, (err, data) => {
    const dataJSON = JSON.parse(data);
    const gatiteActualizado = req.body;
    const id = Number(req.params.id);
    //Busco si existe el id en el json de gatitos. Si existe reemplazo en el array el gatito con los nuevos datos
    if (dataJSON.map((data) => data.id).includes(id)) {
      const newArray = [
        ...dataJSON.slice(0, id),
        gatiteActualizado,
        ...dataJSON.slice(id + 1),
      ];
      fs.writeFile(
        `${__dirname}/assets/cats.json`,
        JSON.stringify(newArray),
        (err) => {
          res.status(200).json({
            status: "succes",
            data: newArray,
          });
        }
      );
    } else {
      //Si no existe el id le respondo al usuario
      return res.status(404).json({
        status: "fail",
        message: "no existe el gatito que esta queriendo actualizar",
      });
    }
  });
});

//Delete
app.delete("/gatitos/:id", (req, res) => {
  //Leo el archivo
  fs.readFile(`${__dirname}/assets/cats.json`, (err, data) => {
    const id = Number(req.params.id);
    const dataJSON = JSON.parse(data);
    //compruebo que exista el id
    if (dataJSON.map((data) => data.id).includes(id)) {
      const gatites = dataJSON.filter((gatite) => gatite.id !== id);

      //Reescribo el archivo
      fs.writeFile(
        `${__dirname}/assets/cats.json`,
        JSON.stringify(gatites),
        (err) => {
          res.status(200).json({
            status: "succes",
            data: gatites,
          });
        }
      );
    } else {
      return res.status(404).json({
        status: "fail",
        message: "no existe el gatito que esta queriendo eliminar",
      });
    }
  });
});

const port = 8080;

app.listen(port, () => {
  console.log(`App corriendo en puerto ${port}`);
});
