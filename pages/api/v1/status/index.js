function status(req, res) {
  res.status(200).json({ status: "healthy" });
}

export default status;
