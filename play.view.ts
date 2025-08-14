namespace $.$$ {
	
	declare var launchQueue: {
		setConsumer: ( consumer: ( params: { files: any[] } )=> void )=> void
	}
	$hyoo_play_api
	type Entry = {
		title: string
		uri: string
	}
	
	export class $hyoo_play extends $.$hyoo_play {
		
		@ $mol_mem
		playlist( next?: string | null ) {
			return this.$.$mol_state_arg.value( 'playlist', next ) ?? super.playlist()
		}
		
		@ $mol_mem
		playlist_files() {
			
			const uri = this.playlist()
			if( !uri ) return []
			
			const text = this.$.$mol_fetch.text( uri )
			
			const files = [ ... text.matchAll( $hyoo_play_m3u_entry ) ]
				.map( cap => cap.groups )
				.filter( $mol_guard_defined )
				.map( ({ title, uri })=> ({ title, uri }) )
				
			return files
		}
		
		@ $mol_mem
		files( next?: Entry[] ) : Entry[] {
			return next ?? this.playlist_files()
		}
		
		receive( transfer: DataTransfer ) {
			
			const files = [] as File[]
			
			function collect( file: File, entry: FileSystemEntry  ) {
				
				if( entry.isFile ) files.push( file )
				
				// if( entry.isDirectory ) {
					
				// 	const reader = ( entry as FileSystemDirectoryEntry ).createReader()
				// 	const more = ()=> {
				// 		reader.readEntries( res => {
							
				// 			if( !res.length ) return
							
				// 			for( const e of res ) {
				// 				;( e as FileSystemFileEntry ).file( f => {
				// 					collect( f, e )
				// 				} )
				// 			}
							
				// 			more()
							
				// 		} )
				// 	}
				// 	more()
					
				// }
				
			}
			
			for( const item of transfer.items ) {
				collect( item.getAsFile()!, item.webkitGetAsEntry()! )
			}
			
			this.files_add( files.sort( $mol_compare_text( file => file.name ) ) )
			
		}
		
		files_add( files: File[] ) {
			
			const entries = files.map( file => ({
				title: file.name.replace( /\.[^.]+$/, '' ),
				uri: URL.createObjectURL( file ),
			}) )
			
			this.files([ ... new Set([ ... this.files(), ... entries ]) ])
			
			if( !this.file_current() ) this.file_current( entries[0] )
			
			return files
		}
		
		// @ $mol_mem
		// file_current( next?: File ) {
		// 	return next ?? this.files()[ 0 ] ?? null
		// }
		
		@ $mol_mem
		queue_files() {
			return this.files().map( ( file , index )=> this.File( file ) )
		}
		
		file_title( file: Entry ) {
			return file.title
		}
		
		file_enabled( file: Entry ) {
			return file !== this.file_current()
		}
		
		file_play( file: Entry ) {
			this.file_current( file )
		}
		
		file_drop( file: Entry ) {
			if( this.file_current() === file ) this.file_current( null )
			this.files( this.files().filter( f => f !== file ) )
		}
		
		movie_search( next?: string ) {
			if( next ) this.playlist( null )
			return this.$.$mol_state_arg.value( 'search', next ) ?? ''
		}
		
		movie_current_id() {
			return Number( this.$.$mol_state_arg.value( 'movie' )  )
		}
		
		movie_current_title() {
			return this.movie_current()!.title()
		}
		
		@ $mol_mem
		player_uri() {
			const movie = this.movie_current()
			if( !movie ) return ''
			return movie.players().get( this.player_id() )?.uri() ?? ''
		}
		
		@ $mol_mem
		player_id( next?: string ) {
			return this.$.$mol_state_local.value( `player=${ this.movie_current_id() }`, next ) ?? ''
		}
		
		@ $mol_mem
		player_options() {
			return [ '', ... this.movie_current()!.players().keys() ]
		}
		
		@ $mol_mem_key
		player_name( id: number ) {
			return String( id || this.player_name_none() )
		}
		
		@ $mol_mem
		movies() {
			
			const movies = new Map( this.movies_found() )
			
			const current = this.movie_current()
			if( current ) movies.set( current.id(), current  )
			
			return movies
		}
		
		@ $mol_mem
		movie_current() {
			const current = this.movie_current_id()
			if( !current ) return null
			return $hyoo_play_api_movie.make({ id: $mol_const( current ) })
		}
		
		@ $mol_mem
		movies_found() {
			
			if( !this.movie_search() ) return new Map< number, $hyoo_play_api_movie >(
				this.bookmarks().toReversed().map( id => [ id, this.$.$hyoo_play_api_movie.make({ id: $mol_const( id ) }) ] )
			)
			
			this.$.$mol_wait_timeout( 500 )
			
			return this.$.$hyoo_play_api.search( this.movie_search() )
			
		}
		
		@ $mol_mem
		queue_movies() {
			return [ ... this.movies().keys() ].map( id => this.Movie( id ) )
		}
		
		@ $mol_mem
		queue_items() {
			return this.playlist() || this.file_current() ? this.queue_files() : this.queue_movies()
		}
		
		movie_poster( id: number ) {
			return this.movies().get( id )?.poster() ?? 'about:blank'
		}
		
		movie_id( id: number ) {
			return String( id )
		}
		
		@ $mol_mem_key
		movie_title( id: number ) {
			const movie = this.movies().get( id )
			return ( movie?.title() ?? '' ) + ' (' + movie?.year() + ')'
		}
		
		@ $mol_mem
		sidebars() {
			return [
				... this.movie_current_id() ? [ this.Source( this.movie_current_id() ) ] : []
			]
		}
		
		@ $mol_mem
		pages() {
			return [
				this.Queue(),
				... this.file_current() ? [ this.Player() ] : [
					... this.movie_current_id() ? [ this.Movie_page( this.movie_current_id() ) ] : [],
				],
			]
		}
		
		@ $mol_mem
		play_title() {
			const file = this.file_current()
			return file?.title.replace( /\.[^.]+$/, '' ) ?? ''
		}
		
		@ $mol_mem
		play_uri() {
			return this.file_current()?.uri ?? 'about:blank'
		}
		
		jump_next() {
			
			const player = this.Player()
			const files = this.files()
			let index = ( files.indexOf( this.file_current() ) + 1 ) % files.length
			
			this.file_current( files[ index ] )
			player.playing( true )
			
		}
		
		jump_prev() {
			
			const player = this.Player()
			const files = this.files()
			let index = ( files.indexOf( this.file_current() ) - 1 + files.length ) % files.length
			
			this.file_current( files[ index ] )
			player.playing( true )
			
		}
		
		@ $mol_mem
		auto_switch() {
			
			if( this.files().length < 2 ) return null
			
			const player = this.Player()
			if( player.playing() ) return null
			if( player.time() !== player.duration() ) return null
			
			new $mol_after_frame( ()=> this.jump_next() )
			
			return null
		}
		
		@ $mol_mem
		handle_files() {
			if( typeof launchQueue === 'undefined' ) return null
			launchQueue.setConsumer( async( params )=> {
				const files = await Promise.all( [ ... params.files ].map( handle => handle.getFile() ) )
				this.files_add( files )
			} )
			return null
		}
		
		@ $mol_mem
		handle_actions() {
			
			navigator.mediaSession.metadata = new MediaMetadata({
				title: this.file_current()?.title,
				artist: '',
				album: '',
			});
			
			navigator.mediaSession.setActionHandler( 'nexttrack', details => this.jump_next() )
			navigator.mediaSession.setActionHandler( 'previoustrack', details => this.jump_prev() )
			
			return null
		}
		
		@ $mol_mem
		bookmarks( next?: readonly number[]) {
			return this.$.$mol_state_local.value( 'bookmarks', next ) ?? []
		}
		
		@ $mol_mem_key
		movie_bookmark( id: number, next?: boolean ) {
			
			const list = this.bookmarks()
			if( next === undefined ) return list.includes( id )
			
			if( next ) this.bookmarks([ ... list, id ])
			else this.bookmarks( list.filter( i => i != id ) )
		
			return next
		}
		
		@ $mol_mem_key
		movie_content( id: number ) {
			return [
				... this.player_id() ? [ this.Player_ext( id ) ] : [ this.Movie_info( id ) ],
			]
		}
		
		@ $mol_mem
		movie_uri_kp() {
			return this.movie_current()!.uri_kp()
		}
		
		@ $mol_mem
		movie_uri_imdb() {
			return this.movie_current()!.uri_imdb() ?? ''
		}
		
		@ $mol_mem_key
		movie_descr( id: number ) {
			
			const movie = this.movies().get( id )!
			let descr = movie.descr()
			
			if( movie.slogan() ) descr = '" ' + movie.slogan() + '\n' + descr
			
			return descr
		}
		
		movie_genres( id: number ) {
			return this.movies().get( id )!.genres().join( ', ' )
		}
		
		@ $mol_mem
		cover() {
			const poster = this.movie_current()?.poster() || 'https://habrastorage.org/webt/6l/sw/vg/6lswvg5cbp8-_-xuhg-aeuehsb4.jpeg'
			return `linear-gradient( #000000DF ), url( ${JSON.stringify( poster )} )`
		}
		
		@ $mol_mem
		similars() {
			return [ ... this.movie_current()!.similars().keys() ].map( id => this.Similar( id ) )
		}
		
		similar_title( id: number ) {
			return this.movie_current()!.similars().get( id )!.title()
		}
		
		similar_poster( id: number ) {
			return this.movie_current()!.similars().get( id )!.poster()
		}
		
		similar_id( id: number ) {
			return String( id )
		}
		
		@ $mol_mem
		override members() {
			return [ ... this.movie_current()!.members().keys() ].map( id => this.Member( id ) )
		}
		
		override member_name( id: number ) {
			return this.movie_current()!.members().get( id )!.name
		}
		
		override member_role( id: number ) {
			return [ ... this.movie_current()!.members().get( id )!.roles.values() ].join( ', ' )
		}
		
		override member_photo( id: number ) {
			return this.movie_current()!.members().get( id )!.photo
		}
		
		override member_link( id: number ) {
			return this.movie_current()!.members().get( id )!.link
		}
		
		auto() {
			this.auto_switch()
			this.handle_files()
			this.handle_actions()
		}
		
	}
}
