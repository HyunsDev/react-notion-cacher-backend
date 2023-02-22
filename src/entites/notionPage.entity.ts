import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notion_page')
export class NotionPageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  pageId: string;

  @Column({ nullable: true })
  pageCode?: string;

  @Column({ default: 'index' })
  domain: string;

  @Column({ type: 'mediumtext', nullable: true })
  recordMap?: string;

  @Column({ type: 'datetime' })
  cachedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
