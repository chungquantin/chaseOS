/**
 * The scene's PBR textures (CC0, Poly Haven, downscaled to 512 px). Kept in
 * a plain module so the server layout can preload them with the first HTML
 * response, in parallel with the 3D code.
 */
export const TEXTURE_FILES = {
  oakMap: "/textures/laminate_floor_02_diff_1k.jpg",
  oakNormal: "/textures/laminate_floor_02_nor_gl_1k.jpg",
  oakRough: "/textures/laminate_floor_02_rough_1k.jpg",
  walnutNormal: "/textures/wood_table_001_nor_gl_1k.jpg",
  walnutRough: "/textures/wood_table_001_rough_1k.jpg",
  plasterNormal: "/textures/painted_plaster_wall_nor_gl_1k.jpg",
  plasterRough: "/textures/painted_plaster_wall_rough_1k.jpg",
  velvetNormal: "/textures/velour_velvet_nor_gl_1k.jpg",
  velvetRough: "/textures/velour_velvet_rough_1k.jpg",
} as const;
