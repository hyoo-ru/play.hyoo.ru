namespace $ {
	
	export const $hyoo_play_api_search_movie_data = $mol_data_record({
		id: $mol_data_integer,
		title: $mol_data_string,
		year: $mol_data_pipe( $mol_data_string, Number ),
		poster: $mol_data_string,
	})
	
	export const $hyoo_play_api_movie_data = $mol_data_record({
		name_original: $mol_data_string,
		year: $mol_data_integer,
		poster_url_preview: $mol_data_string,
	})
	
	export const $hyoo_play_api_player_data = $mol_data_record({
		name: $mol_data_string,
		iframe: $mol_data_string,
	})
	
	export class $hyoo_play_api extends $mol_object {
		
		@ $mol_mem_key
		static search( query: string ): Map< number, $hyoo_play_api_movie > {
			
			if( !query.trim() ) return new Map
			
			const resp = ( this.$.$mol_fetch.json( `https://api4.rhhhhhhh.live/search/${ encodeURIComponent( query ) }` ) as any[] )
				.map( $hyoo_play_api_search_movie_data )
			
			return new Map(
				resp.map( data => [ data.id, $hyoo_play_api_movie.make({
					id: $mol_const( data.id ),
					title: $mol_const( data.title ),
					poster: $mol_const( data.poster ),
					year: $mol_const( data.year ),
				}) ] )
			)
			
		}
		
	}
	
	export class $hyoo_play_api_movie extends $mol_object {
		
		id() {
			return 0
		}
		
		@ $mol_mem
		data() {
			return $hyoo_play_api_movie_data(
				this.$.$mol_fetch.json( `https://api4.rhhhhhhh.live/kp_info2/${ this.id() }` )  as any
			) 
		}
		
		title() {
			return this.data().name_original
		}
		
		year() {
			return this.data().year
		}
		
		poster() {
			return this.data().poster_url_preview
		}
		
		@ $mol_mem
		players() {
			
			const resp = ( this.$.$mol_fetch.json( `https://api4.rhhhhhhh.live/cache`, {
					method: 'POST',
					headers: {
						'content-type': 'application/x-www-form-urlencoded',
					},
					body: new URLSearchParams({
						type: 'movie',
						kinopoisk: String( this.id() ),
					}).toString(),
				} ) as any[]
			).map( $hyoo_play_api_player_data ).sort( $mol_compare_text(  data => data.name ) )
			
			return new Map( resp.map( data => [ data.name, $hyoo_play_api_player.make({ data: $mol_const( data ) }) ] ) )
		}
		
	}
	
	export class $hyoo_play_api_player extends $mol_object {
		
		data() {
			return null as any as typeof $hyoo_play_api_player_data.Value
		}
		
		title() {
			return this.data().name
		}
		
		uri() {
			return this.data().iframe
		}
		
	}
	
}
