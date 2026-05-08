class AdController {
  constructor(adService) {
    this.service = adService;
  }

  async createOrGet(req, res) {
    try {
      const ad = await this.service.createOrGet({
        url: req.body.url,
        userId: req.body.userId,
        refresh: !!req.body.refresh,
        correlationId: req.correlationId,
      });
      return res.status(200).json({ status: true, data: ad });
    } catch (e) {
      const code = e.statusCode || 500;
      return res.status(code).json({
        status: false,
        error: e.message || 'Internal error',
      });
    }
  }

  async getById(req, res) {
    try {
      const refresh =
        req.query.refresh === 'true' || req.query.refresh === '1';
      const userIdHeader = req.headers['x-user-id'];
      const userId =
        userIdHeader != null && userIdHeader !== ''
          ? Number(userIdHeader)
          : NaN;

      const ad = await this.service.getById(req.params.id, {
        userId: Number.isFinite(userId) ? userId : 0,
        refresh,
        correlationId: req.correlationId,
      });
      return res.status(200).json({ status: true, data: ad });
    } catch (e) {
      const code = e.statusCode || 500;
      return res.status(code).json({
        status: false,
        error: e.message || 'Internal error',
      });
    }
  }
}

module.exports = AdController;
