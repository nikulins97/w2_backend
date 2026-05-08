class AdRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByUrl(sourceUrl) {
    return this.prisma.ad.findUnique({ where: { sourceUrl } });
  }

  async findById(id) {
    return this.prisma.ad.findUnique({ where: { id } });
  }

  async upsert(sourceUrl, create, update) {
    return this.prisma.ad.upsert({
      where: { sourceUrl },
      create,
      update,
    });
  }
}

module.exports = AdRepository;
